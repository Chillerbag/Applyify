console.log("done");
chrome.storage.onChanged.addListener(async (changes, area) => {
    // we also check companydescription because its the last one to add, to save on calls to check_storage()
    if (area === "local") {
        console.log("starting gemini");
        result_obj = await check_storage();
        if (result_obj) {
            console.log("bootng up gemini");
            // this is probably super error prone, so we should error handle here!!
            cur_writer = await writerModelSetup();

            //TODO: THESE SHOULD RUN SIMULTANEOUS? 
            // make cv suggestion
            cv_base_string = templateForGeminiPrompt("write an excellent cover letter for {jobTitle} at {companyName}. The job info is {jobInfo}, and the description is {jobDescription}. Its important to also include what the company stands for. Here's the company description: {companyDescription}");
            cv_target = document.getElementById("CVContent");
            await geminiWriterHandler(result_obj, cur_writer, cv_base_string, cv_target);

            // make skill checklsit
            skills_base_string = templateForGeminiPrompt("write a list of skills required for {jobTitle}. The job info is {jobInfo}, and the description is {jobDescription}.");
            skills_target = document.getElementById("skillChecklist");
            await geminiWriterHandler(result_obj, cur_writer, skills_base_string, skills_target);
        }
        else {
            // throw error, not enough job info
            // we should probably display this in some form of textbox. 
            throw new Error("not enough info from job!")
        }
    }
});

// this is kind of not performant.
async function check_storage() {
    const field_arr = ["jobTitle", "jobInfo", "jobDescription", "companyName", "companyInfo", "companyDescription"];
    const results_obj = {};
    for (field in field_arr) {
        const field_result = await chrome.storage.local.get([field])
        if (field_result) {
            results_obj[field] = field_result;
            continue;
        }
        else {
            // should error handle here probaby
            return false;
        }
    }
    return results_obj;
}

async function writerModelSetup() {
    const writer = await ai.writer.create();
    return writer; 
}

async function geminiWriterHandler(results_obj, writer, base_string, target) {
    const prompt = base_string(results_obj);
    console.log(`prompt string: ${prompt}`);

    const stream = await writer.writeStreaming(
        prompt
    );

    for await (const chunk of stream) {
        target.append(chunk);
    }
}


function templateForGeminiPrompt(base_string) {
    return (values) => base_string.replace(/{(\w+)}/g, (match, key) => values[key]);
}


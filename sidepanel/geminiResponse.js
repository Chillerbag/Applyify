chrome.storage.onChanged.addListener(async (changes, area) => {
    // we also check companydescription because its the last one to add, to save on calls to check_storage()
    if (chrome.storage.session.get(["companyDescription"]) && area === "session") {
        result_obj = check_storage();
        if (result_obj) {
            // this is probably super error prone, so we should error handle here!!
            cur_writer = writerModelSetup();

            // make cv suggestion
            cv_base_string = templateForGeminiPrompt("write an excellent cover letter for {jobTitle} at {companyName}. The job info is {jobInfo}, and the description is {jobDescription}. Its important to also include what the company stands for. Here's the company description: {companyDescription}");
            cv_target = document.getElementById("CVContent");
            await geminiWriterHandler(result_obj, cur_writer, cv_base_string, cv_target);


            // make skill checklsit
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
        const field_result = await chrome.storage.session.get([field])
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


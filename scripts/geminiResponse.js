const TIME_OUT = 1000; // 1000 milliseconds

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local") {
    console.log("checking storage...");
    const dataGrabbed = checkStorage("dataGrabbed");
    // TODO: feed resume into gemini as well
    //const resumeUploaded = checkStorage("resumeUploaded", false);

    if (dataGrabbed) {
      console.log("booting up gemini...");
      // this is probably super error prone, so we should error handle here!!
      cur_writer = await writerModelSetup();

      // grab job details
      const {
        jobTitle,
        jobInfo,
        jobDescription,
        companyName,
        companyInfo,
        companyDescription,
      } = await grabJobDetails();

      //TODO: THESE SHOULD RUN SIMULTANEOUS?
      // make cv suggestion
      const cv_prompt = `Write an excellent cover letter for ${jobTitle} at ${companyName}. The job info is ${jobInfo}, and the description is ${jobDescription}. Its important to also include what the company stands for. Here's the company description: ${companyDescription}`;
      const cv_target = document.getElementById("CVContent");
      await geminiWriterHandler(cv_prompt, cur_writer, cv_target);

      // make skill checklist
      const skills_prompt = `Write a list of skills required for ${jobTitle}. The job info is ${jobInfo}, and the description is ${jobDescription}.`;
      const skills_target = document.getElementById("skillChecklist");
      await geminiWriterHandler(skills_prompt, cur_writer, skills_target);
    } else {
      // throw error, not enough job info
      // we should probably display this in some form of textbox.
      throw new Error(
        `Timeout: could not grab all job details in ${TIME_OUT} milliseconds`
      );
    }
  }
});

// FIXME: best practice to store variables in storage like this? in future want to treat scraper like api instead
async function checkStorage(variable, has_timeout = true, timeout = TIME_OUT) {
  const { varGrabbed } = await chrome.storage.local.get(`${variable}`);
  // wait for variable data to be grabbed from storage if not grabbed yet
  while (!varGrabbed) {
    if (has_timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
    const { newVarGrabbed } = await chrome.storage.local.get(`${variable}`);
    if (newVarGrabbed) {
      varGrabbed = newVarGrabbed;
    }
  }
  if (!varGrabbed) {
    throw new Error(`Could not grab ${variable} from storage`);
  }
  return varGrabbed;
}

async function grabJobDetails() {
  const field_arr = [
    "jobTitle",
    "jobInfo",
    "jobDescription",
    "companyName",
    "companyInfo",
    "companyDescription",
  ];
  const job_details = {};
  // grab each field from storage
  const promises = field_arr.map((field) =>
    chrome.storage.local.get(field).then((result) => {
      if (result[field]) {
        job_details[field] = result[field];
      } else {
        throw new Error(`Missing field: ${field}`);
      }
    })
  );
  await Promise.all(promises);
  return job_details;
}

async function writerModelSetup() {
  const writer = await ai.writer.create();
  return writer;
}

async function geminiWriterHandler(prompt, writer, target) {
  console.log(`prompt: ${prompt}`);

  const stream = await writer.writeStreaming(prompt,
    {
      context: "I'm trying to get a job as a software engineer.",
    }
  );

  for await (const chunk of stream) {
    target.append(chunk);
  }
}

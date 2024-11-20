const TIME_OUT = 1000; // 1000 milliseconds
const CV_TEMPLATE = `
Write an excellent cover letter. Here is the template:

[Your Name]
[Your Address]
[City, State, Zip Code]
[Email Address]
[Phone Number]
[Date]

[Employer's Name]
[Company Name]
[Company Address]
[City, State, Zip Code]

Dear [Employer's Name],

I am writing to express my interest in the [Job Title] position at [Company Name], as advertised on [where you found the job posting]. With my background in [relevant field or expertise], combined with my skills in [key skills], I am confident that I can make a valuable contribution to your team.

In my previous role at [Previous Company], I [briefly describe a relevant accomplishment or responsibility]. This experience has helped me develop [specific skills or knowledge] that directly align with the requirements for this position. I am particularly excited about the opportunity to work with [mention something specific about the company or its projects that interests you].

I am eager to bring my skills in [list 2-3 relevant skills] and my passion for [mention your enthusiasm for the field or industry] to [Company Name]. I believe that my combination of [mention any key qualifications, experiences, or education] will allow me to contribute effectively to your team and help [Company Name] achieve its goals.

Thank you for considering my application. I look forward to the opportunity to discuss how my background, skills, and enthusiasm can contribute to the success of [Company Name]. Please feel free to contact me at [your phone number] or via email at [your email address] to arrange an interview.

Sincerely,
[Your Name]`;

const cv_target = document.getElementById("CVContent");
const skills_target = document.getElementById("skillChecklist");

async function promptGemini() {
  console.log("checking storage...");
  const dataGrabbed = checkStorage("dataGrabbed");
  // TODO: feed resume into gemini as well
  //const resumeUploaded = checkStorage("resumeUploaded", false);

  if (dataGrabbed) {
    console.log("job data grabbed!");
    console.log("booting up gemini...");
    // this is probably super error prone, so we should error handle here!!
    let writer = await writerModelSetup();

    // grab job details
    const {
      jobTitle,
      jobInfo,
      jobDescription,
      companyName,
      companyInfo,
      companyDescription,
    } = await grabJobDetails();

    //TODO: THESE SHOULD RUN SIMULTANEOUS? not sure if possible - gemini running locally, so only one instance allowed?
    let cv_context = `The job title is ${jobTitle} at ${companyName}. The job info is ${jobInfo}, and the description is ${jobDescription}. Its important to also include what the company stands for. Here's the company description: ${companyDescription}`;
    // make cv suggestion
    await geminiWriterHandler(
      CV_TEMPLATE,
      cv_context,
      writer,
      cv_target
    );

    // make skill checklist
    let skills_prompt = `Write the list of skills required for this job.`;
    let skills_context = `The job title is ${jobTitle}, the job info is ${jobInfo}, and the job description is ${jobDescription}.`;
    await geminiWriterHandler(
      skills_prompt,
      skills_context,
      writer,
      skills_target
    );
  } else {
    // throw error, not enough job info
    // we should probably display this in some form of textbox.
    throw new Error(
      `Timeout: could not grab all job details in ${TIME_OUT} milliseconds`
    );
  }
  console.log("gemini done!");
  // clear storage
  await chrome.storage.local.clear();
}

// FIXME: best practice to store variables in storage like this? in future want to treat scraper like api instead
async function checkStorage(variable, has_timeout = true, timeout = TIME_OUT) {
  const { test, varGrabbed } = await chrome.storage.local.get(`${variable}`);
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
  const writer = await ai.writer.create({
    tone: "formal"
  });
  
  // TODO: await ai.writer.create({
  // sharedContext: [input resume here?]
  //});
  return writer;
}

async function geminiWriterHandler(prompt, context, writer, target) {
  console.log(`prompt: ${prompt}`);
  console.log(`context: ${context}`);

  const stream = await writer.writeStreaming(prompt, {
    context: context,
  });

  let response = "";
  for await (const chunk of stream) {
    response = chunk;
  }
  console.log(`response: ${response}`);
  target.innerHTML = response;
}


// wait for the page to fully load before prompting gemini
window.addEventListener("load", function () {
  console.log("window fully loaded!");
  cv_target.innerHTML = "Loading...";
  skills_target.innerHTML = "Loading...";
  promptGemini();
});
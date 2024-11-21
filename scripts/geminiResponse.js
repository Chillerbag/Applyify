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
const resume_target = document.getElementById("resumeContent");
var resumeAvaliable = false;

document.addEventListener("resumeAvaliable", () => {
  resumeAvaliable = true;
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'processJobDetails') {
    await promptGemini(message.jobDetails);
  }
});

async function promptGemini(jobDetails) {
  console.log("booting up gemini...");
  // this is probably super error prone, so we should error handle here!!
  let writer = await writerModelSetup();
  let context = `Job details: ${jobDetails}`;

  //TODO: THESE SHOULD RUN SIMULTANEOUS? not sure if possible - gemini running locally, so only one instance allowed?

  // make cv suggestion
  await geminiWriterHandler(CV_TEMPLATE, context, writer, cv_target);
  
  // make skill checklist
  let skills_prompt = `Write the list of skills required for this job.`;
  await geminiWriterHandler(
    skills_prompt,
    context,
    writer,
    skills_target
  );
  console.log("gemini done!");



  // make resume suggestions
  if (resumeAvaliable) {
    let rewriter = await rewriterModelSetup();
    const resume_obj = await chrome.storage.local.get(["resume"]);
    const resume_text = resume_obj.resume;
    console.log(`the resume object is ${resume_obj}`);
    console.log(`the resume text is: ${resume_text}`)
    const resume_prompt = `update the following resume to fit the needs of the current job. ${resume_text}`;
    await geminiRewriterHandler(resume_prompt, context, rewriter, resume_target);
  } else {
    resume_target.innerHTML = "please upload your resume to use this feature!";
  }
}

// FIXME: best practice to store variables in storage like this? in future want to treat scraper like api instead
async function checkStorage(variable, has_timeout = true, timeout = TIME_OUT) {
  const value = await chrome.storage.local.get(variable);
  let grabSuccess = value.dataGrabbed;
  console.log(grabSuccess);
  // wait for variable data to be grabbed from storage if not grabbed yet

  // TODO: fix this
  while (!grabSuccess) {
    if (has_timeout) {
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
    const newVarGrabbed = await chrome.storage.local.get(variable);
    const newGrabSuccess = newVarGrabbed.dataGrabbed;
    console.log(newGrabSuccess);
    if (newGrabSuccess) {
      grabSuccess = newGrabSuccess;
      console.log(`vargrabbed: ${grabSuccess}`);
    }
  }
  if (!grabSuccess) {
    throw new Error(`Could not grab ${variable} from storage`);
  }
  return grabSuccess;
}

async function grabFromStorage(variable) {
  const result = await chrome.storage.local.get(variable);
  if (result[variable]) {
    return result[variable];
  } else {
    throw new Error(`Missing variable: ${variable}`);
  }
}

async function writerModelSetup() {
  const writer = await ai.writer.create({
    tone: "formal",
  });

  // TODO: await ai.writer.create({
  // sharedContext: [input resume here?]
  //});
  return writer;
}

async function rewriterModelSetup() {
  const rewriter = await ai.rewriter.create();

  // TODO: await ai.writer.create({
  // sharedContext: [input resume here?]
  //});
  return rewriter;
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
    target.innerHTML = response;
  }
  console.log(`response: ${response}`);
}

async function geminiRewriterHandler(prompt, context, rewriter, target) {
  console.log(`prompt: ${prompt}`);
  console.log(`context: ${context}`);
  // todo, wait for google to fix? 
  const stream = await rewriter.rewriteStreaming(prompt);

  let response = "";
  for await (const chunk of stream) {
    response = chunk;
    target.innerHTML = response;
  }
  console.log(`response: ${response}`);
}

// wait for the page to fully load before prompting gemini
window.addEventListener("load", function () {
  console.log("window fully loaded!");
  cv_target.innerHTML = "Loading...";
  skills_target.innerHTML = "Loading...";
});

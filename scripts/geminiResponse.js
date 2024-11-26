/*
File: geminiResponse.js
Description: The handler for all gemini related calls. Responds to the scraper's message that we've found a job.
Last modified: 21/11/2024 by Ethan 
*/

// -------------------------------------------------------------------
//                                 Constants
// -------------------------------------------------------------------
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

// where we ask gemini to update
const cv_target = document.getElementById("CVContent");
const skills_target = document.getElementById("skillChecklist");
const resume_target = document.getElementById("resumeContent");
const targets = [cv_target, skills_target, resume_target];

// writer and rewriter should be constants we populate on document load.
let writer = null;
let rewriter = null;

// flags for executing certain things
let resumeAvaliable = false;

// -------------------------------------------------------------------
//                                 Listeners
// -------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  try {
    writer = await writerModelSetup();
    rewriter = await writerModelSetup();
  } catch (error) {
    for (const target of targets) {
      target.innerHTML = `<span style='color: red;'>**error! Gemini is not availiable to you yet. please check your install of Gemini and try again.</span>`;
    }
  }
});

// check if a resume has been uploaded, if so, we can do the resume updates.
document.addEventListener("resumeAvaliable", () => {
  resumeAvaliable = true;
});

// check if the scraper told us its found a job.
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'broadcastJobDetails') {
    await promptGemini(message.jobDetails);
  }
});

// wait for the page to fully load before prompting gemini.
// TODO: we need to find some way to stop showing stuff until we know the scraper is scraping the right stuff.
// maybe this could involve more specific urls? so the scraper doesnt get trigger happy, linkedin.com/jobs may not be good enough
window.addEventListener("load", async function () {
  for (const target of targets) {
    target.innerHTML = "Loading...";
  }
});

// check if gemini got stuck.
document.addEventListener("geminiFailed", (data) => {

  const prompt = data.detail.prompt;
  const context = data.detail.context;
  const writer = data.detail.writer;
  const target = data.detail.target;

  createRetryButton(target, prompt, context, writer);
});

// -------------------------------------------------------------------
//                             Gemini functions
// -------------------------------------------------------------------
async function promptGemini(jobDetails) {
  let context = `Job details: ${jobDetails}`;
  let skills_prompt = `Write the list of skills required for this job.`;

  await geminiWriterHandler(CV_TEMPLATE, context, writer, cv_target);   // make cv suggestion 
  await geminiWriterHandler(skills_prompt, context, writer, skills_target);   // make skills list

  if (resumeAvaliable) {
    let rewriter = await rewriterModelSetup();   // this isnt fully implemented yet by google, fix later.
    const resume_obj = await chrome.storage.local.get(["resume"]);
    const resume_text = resume_obj.resume;
    const resume_prompt = `update the following resume to fit the needs of the current job. Say specifically what was updated: ${resume_text}`;
    await geminiWriterHandler(resume_prompt, context, writer, resume_target);      // writer is now globally scoped to this file. FIXME: POINTLESS REFERENCE PASSING
  } else {
    resume_target.innerHTML = "please upload your resume to use this feature!";
  }
}

async function writerModelSetup() {
  return await ai.writer.create({
    tone: "formal",
  });
}

async function rewriterModelSetup() {
  return await ai.rewriter.create(); //TODO SPEC THIS FURTHER
}

async function geminiWriterHandler(prompt, context, writer, target) {
  try {
    let response = "";
    const stream = await writer.writeStreaming(prompt, {
      context: context,
    });
    for await (const chunk of stream) {
      response = chunk;
      target.innerHTML = response;
    }
  } catch (error) { 
    target.innerHTML = `<span style='color: red;'>**error! the model had issues with this job. Please try again!</span>`;
    const geminiFailed = new CustomEvent("geminiFailed", {
      detail: {
        prompt: prompt,
        context: context,
        writer: writer,
        target: target
      }
    });
    document.dispatchEvent(geminiFailed);
  }
}

// TODO: if google doesnt finish this soon, lets delete it and go with the writer. 
async function geminiRewriterHandler(prompt, context, rewriter, target) {
  let response = "";
  const stream = await rewriter.rewriteStreaming(prompt);   // todo, wait for google to fix? 

  for await (const chunk of stream) {
    response = chunk;
    target.innerHTML = response;
  }
}
// wait for the page to fully load before prompting gemini
window.addEventListener("load", function () {
  console.log("window fully loaded!");
  cv_target.innerHTML = "Loading...";
  skills_target.innerHTML = "Loading...";
});
// -------------------------------------------------------------------
//                             Helper functions
// -------------------------------------------------------------------
function createRetryButton(target, prompt, context, writer) {
  if (target) {
    const retryButton = document.createElement("button");     // Create a new button element
    retryButton.textContent = "Reprompt Gemini";
    retryButton.classList.add("retry-button");

    retryButton.addEventListener("click", async () => {
      await geminiWriterHandler(prompt, context, writer, target);
    });
    
    target.appendChild(retryButton); // Append the retry button in container. TODO: this should go somewhere else
  }
}

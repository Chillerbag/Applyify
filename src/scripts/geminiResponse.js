/*
File: geminiResponse.js
Description: The handler for all gemini related calls. Responds to the scraper's message that we've found a job.
Last modified: 21/11/2024 by Ethan 
*/

// -------------------------------------------------------------------
//                                 Constants
// -------------------------------------------------------------------
import { marked } from "../../libs/node_modules/marked/lib/marked.esm.js";

const CV_TEMPLATE = `
Write an excellent cover letter using this template:

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
const cv_target = document.getElementById("CVContainer");
const skills_target = document.getElementById("skillChecklistContainer");
const resume_target = document.getElementById("updatedResumeContainer");
const resume_changes_target = document.getElementById("resumeChangesContainer");
const targets = [cv_target, skills_target, resume_target, resume_changes_target];

// writer and rewriter should be constants we populate on document load.
let writer = null;
//let rewriter = null;
let resume_model = null;

let numRetries = 0;

// flags for executing certain things
let resumeAvaliable = false;

// -------------------------------------------------------------------
//                                 Listeners
// -------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  try {
    writer = await writerModelSetup();
    //rewriter = await writerModelSetup();
  } catch (error) {
    for (const target of targets) {
      target.innerHTML = `<span style='color: red;'>**error! Gemini is not availiable to you yet. please check your install of Gemini and try again.</span>`;
    }
  }
});

// check if a resume has been uploaded, if so, we can do the resume updates.
document.addEventListener("resumeAvaliable", async () => {
  resumeAvaliable = true;
  resume_model = await promptModelSetup();
});

// check if the scraper told us its found a job
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "broadcastJobDetails") {
    onJobCleanup();
    numRetries = 0;
    await promptGemini(message.jobDetails);
  }
});

function onJobCleanup() {
  const textboxes = document.querySelectorAll(".textbox");
  const statusImgs = document.querySelectorAll(".statusImg");
  const retryButtons = document.querySelectorAll(".retryButton");
  for (const text of textboxes) {
    text.innerHTML = "";
  }
  for (const status of statusImgs) {
    const loaderDiv = document.createElement('div');
    loaderDiv.classList.add('loader');
    status.replaceWith(loaderDiv);
  }
  for (const retryButton of retryButtons) {
    retryButton.remove();
  }
}

// check if gemini got stuck.
document.addEventListener("geminiFailed", (data) => {

  if (numRetries <= 3) {
    const prompt = data.detail.prompt;
    const context = data.detail.context;
    const writer = data.detail.writer;
    const target = data.detail.target;
    createRetryButton(target, prompt, context, writer);
  } else {
    alert("Gemini is struggling with this job. Please try a different listing. Sorry!");

    //set all to failed to show this job wont work.
    const statusImgs = document.querySelectorAll(".statusImg");
    const loaders = document.querySelectorAll(".loader");

    for (const status of statusImgs) {
      const failImg = document.createElement('img');
      failImg.src = "/images/Fail.png"
      failImg.classList.add('statusImg');
      status.replaceWith(failImg);
    }

    for (const loader of loaders) {
      const failImg = document.createElement('img');
      failImg.src = "/images/Fail.png"
      failImg.classList.add('statusImg');
      loader.replaceWith(failImg);
    }
  }
});

// -------------------------------------------------------------------
//                             Gemini functions
// -------------------------------------------------------------------
async function promptGemini(jobDetails) {
  // loaded now!
  document.getElementById('loadingOverlay').style.display = 'none';

  const context = `Job details: ${jobDetails}`;
  const skills_prompt = `State the skills required for this job in dot points.`;

  await geminiWriterHandler(skills_prompt, context, writer, skills_target); // make skills list

  if (resumeAvaliable) {
    const resume_obj = await chrome.storage.local.get(["resume"]);
    const resume_text = resume_obj.resume;
    const resume_prompt = `State "[RESUME]" then rewrite the resume to fit the job description. Only use information from the resume. After the resume has been completely rewritten, state "[CHANGES]" and state what has been changed in the resume, and why. Resume: [${resume_text}] Job advertisement: [${jobDetails}]`;
    // FIXME: POINTLESS REFERENCE PASSING writer is now globally scoped to this file.
    await geminiPromptHandler(resume_prompt, resume_model, resume_target);
  } else {
    resume_target.innerHTML = "please upload your resume to use this feature!";
  }

  await geminiWriterHandler(CV_TEMPLATE, context, writer, cv_target); // make cv suggestion
}

async function writerModelSetup() {
  return await ai.writer.create({
    tone: "formal",
  });
}

async function promptModelSetup() {
  return await ai.languageModel.create();
}

async function geminiPromptHandler(prompt, model, target) {
  let geminiTarget = target.querySelector('.textbox');
  let resumeTarget = null;
  let changesTarget = null;
  loadHandler(target, -1);
  try {
    const stream = await model.promptStreaming(prompt);
    for await (const chunk of stream) {
      // split up into resume + changes
      if (chunk.includes("[CHANGES]")) {
        resumeTarget = resume_target.querySelector('.textbox');
        changesTarget = resume_changes_target.querySelector('.textbox');

        let resume = chunk.split("[RESUME]")[1];
        resume = resume.split("[CHANGES]")[0];
        resumeTarget.innerHTML = marked(resume);

        let changes = chunk.split("[CHANGES]")[1];
        changesTarget.innerHTML = marked(changes);
      } else if (chunk.includes("[RESUME]")) {
        resumeTarget = resume_target.querySelector('.textbox');

        let resume = chunk.split("[RESUME]")[1];
        resumeTarget.innerHTML = marked(resume);
      } else {
        geminiTarget.innerHTML = marked(chunk);
      }
    }
    const existingButton = target.querySelector('.retry-button');
    if (existingButton) {
      existingButton.remove();
    }
    loadHandler(target, 1);
    if (changesTarget) {
      loadHandler(resume_changes_target, 1);
    }

  } catch (error) {
    console.error("Gemini failed with error: ", error);
    console.log("prompt: ", prompt);
    geminiTarget.innerHTML = `<span style='color: red;'>**error! the model had issues with this job. Please try again!</span>`;
    loadHandler(target, 0);
    const geminiFailed = new CustomEvent("geminiFailed", {
      detail: {
        prompt: prompt,
        model: model,
        target: target,
      },
    });
    document.dispatchEvent(geminiFailed);
  }
}

async function geminiWriterHandler(prompt, context, writer, target) {
  let geminiTarget = target.querySelector('.textbox');
  loadHandler(target, -1);
  try {
    let response = "";
    const stream = await writer.writeStreaming(prompt, {
      context: context,
    });
    for await (const chunk of stream) {
      response = chunk;
      geminiTarget.innerHTML = marked(response);
    }
    const existingButton = target.querySelector('.retry-button');
    if (existingButton) {
      existingButton.remove();
    }
    loadHandler(target, 1);
  } catch (error) {
    console.error("Gemini failed with error: ", error);
    console.log("prompt: ", prompt);
    geminiTarget.innerHTML = `<span style='color: red;'>**error! the model had issues with this job. Please try again!</span>`;
    loadHandler(target, 0);
    const geminiFailed = new CustomEvent("geminiFailed", {
      detail: {
        prompt: prompt,
        context: context,
        writer: writer,
        target: target,
      },
    });
    document.dispatchEvent(geminiFailed);
  }
}

// -------------------------------------------------------------------
//                             Helper functions
// -------------------------------------------------------------------
// TODO: change to work depending on current model (prompt, writer, rewriter) rather than just writer
function createRetryButton(target, prompt, context, writer) {
  if (target) {
    const retryButton = document.createElement("button");
    retryButton.textContent = "Reprompt Gemini";
    retryButton.classList.add("retry-button");

    retryButton.addEventListener("click", async () => {
      retryButton.remove();
      numRetries += 1;
      let geminiTarget = target.querySelector('.textbox');
      geminiTarget.innerHTML = '';
      await geminiWriterHandler(prompt, context, writer, target);
    });
    target.appendChild(retryButton);
  }
}

function loadHandler(target, status) {
  let geminiHeader =  target.querySelector('.header');
  let loadStatus = geminiHeader.querySelector('.loader');

  if (!loadStatus) {

    let imgToReplace = geminiHeader.querySelector('img');
    if (imgToReplace) {

      const loaderDiv = document.createElement('div');
      loaderDiv.classList.add('loader');
      imgToReplace.replaceWith(loaderDiv);
    } // TODO: ERROR HANDLE?
  } else {
    // there is a loader, so we want to replace it with current status
    if (status === 1) {
      const successImg = document.createElement('img');
      successImg.classList.add('statusImg');
      successImg.src = "/images/Succeed.png";
      loadStatus.replaceWith(successImg);
    } else if (status === 0) {
      const failImg = document.createElement('img');
      failImg.src = "/images/Fail.png"
      failImg.classList.add('statusImg');
      loadStatus.replaceWith(failImg);
    }
  }
}

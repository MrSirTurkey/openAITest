import OpenAI from "openai";
import { writeFile } from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

import {
    actions,
    atmospheres,
    characters,
    companionsOrProps,
    compositionStyles,
    descriptors,
    environmentalFeatures,
    materialDetails,
    renderTags,
    roles,
    scenicAtmospheres,
    scenicEnvironmentalFeatures,
    scenicSettings,
    settings,
    viewSubjects,
    viewTypes
} from "./consts";

const client = new OpenAI();

function generateCharacterPrompt() {
    let prompt = "";

    // Section 1: Character/Subject
    const C = characters;
    // Randomly select a character from the list
    prompt += `${C[Math.floor(Math.random() * C.length)]}`;

    // Section 2: Descriptors (Optional)
    const D = descriptors;
    // Randomly select a descriptor from the list, 50% chance to include
    if (Math.random() < 0.6) {
        prompt += ` who is ${D[Math.floor(Math.random() * D.length)]}`;
    }

    // Section 3: Role/Identity (Optional)
    const R = roles;
    // Randomly select a role from the list, 50% chance to include
    if (Math.random() < 0.6) {
        prompt += ` acting as ${R[Math.floor(Math.random() * R.length)]}`;
    }

    // Section 4: Action/Activity
    const A = actions;
    prompt += `, engaged in ${A[Math.floor(Math.random() * A.length)]}`;

    // Section 5: Companions/Props (Optional)
    const P = companionsOrProps;
    // Randomly select a companion or prop from the list, 50% chance to include
    if (Math.random() < 0.6) {
        prompt += `, accompanied by ${P[Math.floor(Math.random() * P.length)]}`;
    }

    // Section 6: Setting/Location
    const S = settings;
    // Randomly select a setting from the list
    prompt += `, located in ${S[Math.floor(Math.random() * S.length)]}`;

    // Section 7: Environmental Features
    const E = environmentalFeatures;
    // Randomly select an environmental feature from the list
    prompt += `, surrounded by ${E[Math.floor(Math.random() * E.length)]}`;

    // Section 8: Atmosphere/Mood/Lighting
    const M = atmospheres;
    prompt += `, that is ${M[Math.floor(Math.random() * M.length)]}`;

    return prompt;
}

function generateScenicPrompt() {
    let prompt = "";

    // Section 1: View Type
    const VT = viewTypes;
    prompt += `${VT[Math.floor(Math.random() * VT.length)]}`;

    // Section 2: Primary Subject
    const PS = viewSubjects;
    prompt += ` of ${PS[Math.floor(Math.random() * PS.length)]}`;

    // Section 3: Composition Style
    const CS = compositionStyles;
    prompt += `, ${CS[Math.floor(Math.random() * CS.length)]}`;

    // Section 4: Material Detail
    const MD = materialDetails;
    prompt += ` ${MD[Math.floor(Math.random() * MD.length)]}`;

    // Section 5: Setting/Location
    const SL = scenicSettings;
    prompt += `, ${SL[Math.floor(Math.random() * SL.length)]}`;

    // Section 6: Environmental Features
    const EF = scenicEnvironmentalFeatures;
    prompt += `, ${EF[Math.floor(Math.random() * EF.length)]}`;

    // Section 7: Atmosphere
    const AT = scenicAtmospheres;
    prompt += `, ${AT[Math.floor(Math.random() * AT.length)]}`;

    // Section 8: Rendering Tags (Optional)
    const RT = renderTags;
    // Randomly select a render tag from the list, 50% chance to include
    if (Math.random() < 0.5) {
        prompt += ` — ${RT[Math.floor(Math.random() * RT.length)]}.`;
    } else {
        prompt += '.';
    }

    return prompt;
}

async function main() {
    // Get filename from command line argument or use default
    const filename = process.argv[2] || "output.png";

    const prompt = Math.random() < 0.8 ? generateCharacterPrompt() : generateScenicPrompt();

    console.log(`Generating image with filename: ${filename} and prompt: ${prompt}`);

    // Write prompt to logfile
    const logFilePath = process.env.LOG_FILE_PATH || "image_generation.log";
    // Current date and time
    const date = new Date().toISOString();
    await writeFile(logFilePath, `\n[${date}] Generating image with filename: ${filename} and prompt: ${prompt}\n`, { flag: "a" });

    const img = await client.images.generate({
        model: "dall-e-3",
        prompt: "THIS PROMPT ALREADY CONTAINS ENOUGH DETAIL. DO NOT add any detail, DO NOT add any typography, writing or text, just use it AS-IS: " + prompt + "-- no text, no labels, no writing, no words in the image",
        n: 1,
        size: "1792x1024",
        style: Math.random() < 0.5 ? "vivid" : "natural",
        response_format: "b64_json",
        quality: "hd"
    });

    console.log("Image generation response:", img);

    if (!img.data || img.data.length === 0 || !img.data[0].b64_json) {
        throw new Error("No image data returned from OpenAI API");
    }

    const imageBuffer = Buffer.from(img.data![0].b64_json!, "base64");
    const outputPath = process.env.IMAGE_PATH + filename;
    await writeFile(outputPath, imageBuffer);

    console.log(`Image saved to: ${outputPath}`);
}

main()
    .then(() => console.log("Image generated and saved successfully"))
    .catch((error) => console.error("Error generating image:", error));
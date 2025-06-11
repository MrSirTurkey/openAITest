import OpenAI from "openai";
import { writeFile } from "fs/promises";
import dotenv from "dotenv";
dotenv.config();

import { actions, atmospheres, characters, companionsOrProps, descriptors, environmentalFeatures, roles, settings, viewSubjects, viewTypes, visualStyles } from "./consts";

const client = new OpenAI();

function generatePrompt() {
    // Combine sections to create a full prompt

    let prompt = "";

    //CASE: Standard character generation
    if (Math.random() < 0.8) {
        // Section 1: Character/Subject
        const C = characters;
        // Randomly select a character from the list
        prompt += `${C[Math.floor(Math.random() * C.length)]}`;

        // Section 2: Descriptors (Optional)
        const D = descriptors;
        // Randomly select a descriptor from the list, 50% chance to include
        if (Math.random() < 0.5) {
            prompt += ` who is ${D[Math.floor(Math.random() * D.length)]}`;
        }

        // Section 3: Role/Identity (Optional)
        const R = roles;
        // Randomly select a role from the list, 50% chance to include
        if (Math.random() < 0.5) {
            prompt += `, they are ${R[Math.floor(Math.random() * R.length)]}`;
        }

        // Section 4: Action/Activity
        const A = actions;
        prompt += `, ${A[Math.floor(Math.random() * A.length)]}`;

        // Section 5: Companions/Props (Optional)
        const P = companionsOrProps;
        // Randomly select a companion or prop from the list, 50% chance to include
        if (Math.random() < 0.5) {
            prompt += `, accompanied by ${P[Math.floor(Math.random() * P.length)]}`;
        }
    }
    //CASE: Scenic view generation
    else {
        // Section 1: View Type
        const VT = viewTypes;
        // Randomly select a view type from the list
        prompt += `${VT[Math.floor(Math.random() * VT.length)]}`;

        // Section 2: View Subject
        const VC = viewSubjects;
        // Randomly select a view subject from the list
        prompt += ` of ${VC[Math.floor(Math.random() * VC.length)]}`;

        // Section 3: Visual Style
        const VisStyle = visualStyles;
        // Randomly select a visual style from the list
        prompt += `, ${VisStyle[Math.floor(Math.random() * VisStyle.length)]}`;
    }

    // Section 6: Setting/Location
    const S = settings;
    // Randomly select a setting from the list
    prompt += `, in ${S[Math.floor(Math.random() * S.length)]}`;

    // Section 7: Environmental Features
    const E = environmentalFeatures;
    // Randomly select an environmental feature from the list
    prompt += `, featuring ${E[Math.floor(Math.random() * E.length)]}`;

    // Section 8: Atmosphere/Mood/Lighting
    const M = atmospheres;
    prompt += `, ${M[Math.floor(Math.random() * M.length)]}`;

    return prompt;
}

async function main() {
    // Get filename from command line argument or use default
    const filename = process.argv[2] || "output.png";

    const prompt = generatePrompt();

    console.log(`Generating image with filename: ${filename} and prompt: ${prompt}`);

    // Write prompt to logfile
    const logFilePath = process.env.LOG_FILE_PATH || "image_generation.log";
    // Current date and time
    const date = new Date().toISOString();
    await writeFile(logFilePath, `\n[${date}] Generating image with filename: ${filename} and prompt: ${prompt}\n`, { flag: "a" });

    const img = await client.images.generate({
        model: "dall-e-3",
        prompt: "THIS PROMPT ALREADY CONTAINS ENOUGH DETAIL. DO NOT add any detail, just use it AS-IS, providing only the image WITH NO typography: " + prompt,
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
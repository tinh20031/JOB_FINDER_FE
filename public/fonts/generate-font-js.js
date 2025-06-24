const fs = require("fs");
const path = require("path");

const regularFontPath = path.join(__dirname, "Arimo-Regular.ttf");
const boldFontPath = path.join(__dirname, "Arimo-Bold.ttf");

const regularFontBase64 = fs.readFileSync(regularFontPath, "base64");
const boldFontBase64 = fs.readFileSync(boldFontPath, "base64");

const regularJsContent = `export const ArimoRegular = "${regularFontBase64}";`;
const boldJsContent = `export const ArimoBold = "${boldFontBase64}";`;

fs.writeFileSync(
  path.join(__dirname, "Arimo-Regular-normal.js"),
  regularJsContent
);
fs.writeFileSync(path.join(__dirname, "Arimo-Bold-normal.js"), boldJsContent);

console.log("Font JS files generated successfully.");

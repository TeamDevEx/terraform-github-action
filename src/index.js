// const { Terraform } = require("js-terraform");
// const terraform = new Terraform();
const fs = require("fs");

// terraform.plan('../terraform/sample-bucket.tf')

const sampleObject = {
  something: "Hello World",
};

fs.writeFileSync("./sample.json", JSON.stringify(sampleObject));

const sampleRead = fs.readFileSync("./sample.json", "utf-8");
console.log(JSON.stringify(sampleRead));

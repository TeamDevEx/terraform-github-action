const { Terraform } = require("js-terraform");
const terraform = new Terraform();
const fs = require("fs");

// terraform.plan('../terraform/sample-bucket.tf')

fs.writeFileSync("./sample.txt", "qwdqwdqwd");
console.log(fs.readFileSync("./sample.txt"));

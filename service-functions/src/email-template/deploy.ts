import fs from "fs";
import { SESClient, UpdateTemplateCommand } from "@aws-sdk/client-ses";

const TEMPLATE_FILE_PATH = "./src/email-template/template.html"

const htmlPart = fs.readFileSync(TEMPLATE_FILE_PATH, "utf-8");

const ses = new SESClient();

await ses.send(new UpdateTemplateCommand({
  Template: {
    TemplateName: "ScheduledEmailNotification",
    SubjectPart: "{{SUBJECT}}",
    HtmlPart: htmlPart,
    TextPart: "{{CONTENT}}",
  },
}));
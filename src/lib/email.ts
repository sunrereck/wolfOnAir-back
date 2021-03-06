import AWS from 'aws-sdk';
import sanitize from 'sanitize-html';

import { awsSES } from '../config/aws';

AWS.config.update({
  accessKeyId: awsSES.accessKeyId,
  secretAccessKey: awsSES.secretAccessKey,
  region: 'us-east-1'
});

type MailTypes = {
  body: string;
  to: string[];
  subject: string;
}

const ses = new AWS.SES();

const sendMail = ({
  body, to, subject
}: MailTypes) => {
  const params= {
    Destination: {
      ToAddresses: to
    },
    Message: {
      Body: { 
        Html: {
          Charset: "UTF-8",
          Data: body
        },
        Text: {
          Charset: "UTF-8",
          Data: sanitize(body, { allowedTags: [] })
        }
      },      
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: 'partykyoung@gmail.com'
  };

  return new Promise((resolve, reject) => {
    ses.sendEmail(params, (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });
};

export default sendMail;
import { ParameterizedContext } from "koa";
import { Middleware } from "@koa/router";

import querySql from "../../lib/db";
import getHash from "../../lib/crypto";
import sendEmail from "../../lib/email";

/* 이메일 중복 확인 */
export const checkEmail: Middleware = async (
  ctx: ParameterizedContext<any, any>
) => {
  const { email } = ctx.params;

  try {
    const rows: any = await querySql(
      `SELECT uid FROM user WHERE email='${email}'`
    );

    ctx.body = {
      isOk: rows.length <= 0
    };
    ctx.status = 200;
  } catch (e) {
    ctx.throw(e);
    ctx.status = 500;
  }
};

/* 닉네임 중복 확인 */
export const checkUserName: Middleware = async (
  ctx: ParameterizedContext<any, any>
) => {
  const { userName } = ctx.params;

  try {
    const rows: any = await querySql(
      `SELECT uid FROM user WHERE userName='${userName}'`
    );

    ctx.body = {
      isOk: rows.length <= 0
    };
    ctx.status = 200;
  } catch (e) {
    ctx.throw(e);
    ctx.status = 500;
  }
};

/* 회원가입 */
export const join: Middleware = async (ctx: ParameterizedContext<any, any>) => {
  const { body } = ctx.request;
  const { email, password, userName } = body;

  try {
    const cryptoPassword = await getHash(password);
    const { key, salt } = cryptoPassword;

    await querySql(
      `INSERT INTO user(email, userName, password, salt) VALUES('${email}', '${userName}', '${key}', '${salt}')`
    );

    ctx.status = 200;
  } catch (e) {
    ctx.throw(e);
    ctx.throw(500, e);
  }
};

/**
 * 회원가입 인증 이메일 보내기
 * POST
 * @param ctx
 */
export const sendJoinEmail: Middleware = async (
  ctx: ParameterizedContext<any, any>
) => {
  try {
    const { email } = ctx.request.body;
    const values = {
      body: `
        <table style="margin: 0 auto;">
          <tbody>
            <tr>
              <td>
                <h2 style="font-size: 24px; font-weight: 600; text-align: center;">
                  늑대온에어
                </h2>
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; text-align: center;">
                아래의 버튼 또는 링크를 클릭하면 이메일 인증이 완료됩니다.
                <br/>
                <br/>
              </td>
            </tr>
            <tr>
              <td style="text-align: center;">
                <a 
                  href="localhost:3000/join/${email}/complete" 
                  target="_blank" 
                  style="display: block; width: 300px; height: 50px; margin: 0 auto; padding: 16px; border-radius: 5px; background-color: #3399ff; font-size: 17px; box-sizing: border-box; color: #FFFFFF; text-align: center; text-decoration: none;"
                >
                  가입 완료
                </a>
                <br/>
                <a href="localhost:3000/join/email/complete" target="_blank" style="color: #3399ff;">localhost:3000/join/${email}/complete</a>
              </td>
            </tr>
          </tbody>
        </table>
      `,
      subject: "회원가입 확인 이메일",
      to: [email]
    };

    await sendEmail(values);
  } catch (e) {
    ctx.throw(500, e);
  }
};
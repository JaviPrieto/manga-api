import { helpers, Status, httpErrors, Response } from "../deps.ts";
import fetchPage from "../utils/http.ts";
/**
 * get list of users
 * call by ADMIN
 */
const getManga = async ({
  params,
  response,
}: {
  params: { id: string };
  response: Response;
}) => {
  // const users = await fetchPage(params.id);
  response.status = 200;
  response.body = {
    success: true,
    data: params.id,
  };
  return;
};

export { getManga };

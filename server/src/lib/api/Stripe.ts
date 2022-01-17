import stripe from "stripe";

const client = new stripe(`${process.env.S_SECRET_KEY}`, {
  typescript: true,
  apiVersion: "2020-08-27",
});

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      code,
      grant_type: "authorization_code",
    });

    return response;
  },
};

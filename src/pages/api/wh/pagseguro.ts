import type { NextApiRequest, NextApiResponse } from 'next';

import axios from 'axios';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import prisma from '@/server/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const body = JSON.parse(JSON.stringify(req.body));
  const notificationCode = body.notificationCode;

  const options = {
    method: 'GET',
    url: `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/${notificationCode}`,
    params: {
      email: process.env.PAGSEGURO_EMAIL,
      token: process.env.PAGSEGURO_TOKEN,
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  };

  return await axios
    .request({
      ...options,
      params: {
        ...options.params,
      },
    })
    .then(async (response) => {
      const convert = require('xml-js');
      const xml = response.data;
      const result = convert.xml2js(xml, { compact: true, spaces: 4 });
      const paymentId = result.transaction.reference._text;
      const status = result.transaction.status._text;
      if (Number(status) === 3 || Number(status) === 4) {
        await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            paid: true,
          },
        });
        res.status(200).json({ message: 'Payment updated' });
      }
      res.status(201).json({ message: 'Payment not updated' });
    })
    .catch(function (error) {
      res.status(400).json({ error });
    });
}

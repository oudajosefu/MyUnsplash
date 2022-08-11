// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
	newImageData: {};
	error?: string;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (typeof req.query.id === 'string') {
		const link = `https://api.unsplash.com/photos/${req.query.id}`;
		await fetch(link, {
			method: 'GET',
			headers: {
				'Accept-Version': 'v1',
				Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
			},
		})
			.then((result) => result.json())
			.then((data) => {
				res.status(200).json({ newImageData: data });
			})
			.catch((err) => {
				res.status(500).json({ newImageData: {}, error: err });
			});
	} else {
		res.status(400).json({ newImageData: {}, error: 'Invalid id' });
	}
}

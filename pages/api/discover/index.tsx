import { withSentry } from '@sentry/nextjs'
import { get } from 'handlers/discover/get'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res2) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res2)
    default:
      return res2.status(405).end()
  }
}
export default withSentry(handler)

import { withSentry } from '@sentry/nextjs'
import { get } from 'handlers/discover/get'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res3) => {
  switch (req.method) {
    case 'GET':
      return await get(req, res3)
    default:
      return res3.status(405).end()
  }
}
export default withSentry(handler)

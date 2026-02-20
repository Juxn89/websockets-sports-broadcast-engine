import { Router } from 'express'
import { createMatchSchema, MATCH_STATUS } from '../validation/matches'
import { db } from '../db/db'
import { matches } from '../db/schema'
import { getMatchStatus } from '../utils/match-status'

export const matchRouter = Router()

matchRouter.get('/', (req, res) => {
	res.status(200).json({ message: 'Matches list' })
})

matchRouter.post('/', async (req, res) => {
	const parsed = createMatchSchema.safeParse(req.body)

	if(!parsed.success)
		return res.send(400).json({ error: 'Invalid payload', detatils: JSON.stringify(parsed.error) })

	const { startTime, endTime, homeScore, awayScore } = parsed.data
	try {
		const [event] = await db.insert(matches).values({ 
			...parsed.data,
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			homeScore: homeScore ?? 0,
			awayScore: awayScore ?? 0,
			status: getMatchStatus(startTime, endTime) ?? 'scheduled'
		}).returning()

		res.status(201).json({ data: event })
	} catch (error) {
		res.status(500).json({ error: 'Failed to create match.', details: JSON.stringify(error) })
	}
})
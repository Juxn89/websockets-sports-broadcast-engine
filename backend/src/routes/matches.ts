import { Router } from 'express'
import { createMatchSchema, listMatchesQuerySchema, MATCH_STATUS, matchIdParamSchema, updateScoreSchema } from '../validation/matches'
import { db } from '../db/db'
import { matches } from '../db/schema'
import { getMatchStatus, syncMatchStatus } from '../utils/match-status'
import { desc, eq } from 'drizzle-orm';

export const matchRouter = Router()

const MAX_LIMIT = 100

matchRouter.get('/', async (req, res) => {
	const parsed = listMatchesQuerySchema.safeParse(req.query)

	if(!parsed.success)
		return res.status(400).json({ error: 'Invalid query', details: parsed.error.issues })

	const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

	try {
		const data = await db
			.select()
			.from(matches)
			.orderBy( (desc(matches.createdAt)) )
			.limit(limit)

			res.json({ data })
	} catch (error) {
		res.status(500).json({ error: 'Failed to list matches.' })
	}
})

matchRouter.post('/', async (req, res) => {
	const parsed = createMatchSchema.safeParse(req.body)

	if(!parsed.success)
		return res.status(400).json({ error: 'Invalid payload', details: JSON.stringify(parsed.error) })

	const { sport, homeTeam, awayTeam, startTime, endTime, homeScore, awayScore } = parsed.data
	try {
		const [event] = await db.insert(matches).values({
			sport,
			homeTeam,
			awayTeam,
			status: getMatchStatus(startTime, endTime),
			startTime,
			endTime,
			homeScore,
			awayScore,
		}).returning();

		if(res.app.locals.broadcastMatchCreated)
			res.app.locals.broadcastMatchCreated(event)

		res.status(201).json({ data: event })
	} catch (error) {
		res.status(500).json({ error: 'Failed to create match.', details: JSON.stringify(error) })
	}
})

matchRouter.patch('/:id/score', async (req, res) => {
    const paramsParsed = matchIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        return res
					.status(400)
					.json({ error: 'Invalid match id', details: paramsParsed.error });
    }

    const bodyParsed = updateScoreSchema.safeParse(req.body);
    if (!bodyParsed.success) {
        return res
					.status(400)
					.json({ error: 'Invalid payload', details: bodyParsed.error });
    }

    const matchId = paramsParsed.data.id;

    try {
        const [existing] = await db
            .select({
                id: matches.id,
                status: matches.status,
                startTime: matches.startTime,
                endTime: matches.endTime,
            })
            .from(matches)
            .where(eq(matches.id, matchId))
            .limit(1);

        if (!existing) {
            return res.status(404).json({ error: 'Match not found' });
        }

        await syncMatchStatus(existing, async (nextStatus) => {
            await db
                .update(matches)
                .set({ status: nextStatus })
                .where(eq(matches.id, matchId));
        });

        if (existing.status !== MATCH_STATUS.LIVE) {
            return res.status(409).json({ error: 'Match is not live' });
        }

        const [updated] = await db
            .update(matches)
            .set({
                homeScore: bodyParsed.data.homeScore,
                awayScore: bodyParsed.data.awayScore,
            })
            .where(eq(matches.id, matchId))
            .returning();

        if (res.app.locals.broadcastScoreUpdate) {
            res.app.locals.broadcastScoreUpdate(matchId, {
                homeScore: updated.homeScore,
                awayScore: updated.awayScore,
            });
        }

        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update score' });
    }
});
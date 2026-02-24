import { MATCH_STATUS } from '../validation/matches.js';

export function getMatchStatus(startTime: Date, endTime: Date, now = new Date()): 'scheduled' | 'live' | 'finished' {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 'scheduled';
    }

    if (now < start) {
        return 'scheduled';
    }

    if (now >= end) {
        return 'finished';
    }

    return 'live';
}

export async function syncMatchStatus(match: any, updateStatus: (status: 'scheduled' | 'live' | 'finished') => Promise<void>) {
    const nextStatus = getMatchStatus(match.startTime, match.endTime);
    if (match.status !== nextStatus) {
        await updateStatus(nextStatus);
        match.status = nextStatus;
    }
    return match.status;
}
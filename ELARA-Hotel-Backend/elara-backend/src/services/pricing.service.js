import { prisma } from '../config/prisma.js';

const ACTIVE_RESERVATION_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN'];

function decimal(value) {
  return Number(value ?? 0);
}

function overlaps(checkInDate, checkOutDate) {
  return {
    checkInDate: { lt: checkOutDate },
    checkOutDate: { gt: checkInDate },
    status: { in: ACTIVE_RESERVATION_STATUSES }
  };
}

export async function getOccupancyRate(checkInDate, checkOutDate) {
  const [sellableRooms, occupiedCount] = await Promise.all([
    prisma.room.count({ where: { status: { notIn: ['MAINTENANCE', 'OUT_OF_SERVICE'] } } }),
    prisma.reservation.count({
      where: {
        ...overlaps(checkInDate, checkOutDate),
        assignedRoomId: { not: null }
      }
    })
  ]);

  return sellableRooms ? (occupiedCount / sellableRooms) * 100 : 0;
}

function ruleMatches(rule, ctx) {
  if (rule.roomTypeId && rule.roomTypeId !== ctx.roomTypeId) return false;
  if (rule.startDate && ctx.checkInDate < rule.startDate) return false;
  if (rule.endDate && ctx.checkInDate > rule.endDate) return false;
  if (rule.dayOfWeek != null && rule.dayOfWeek !== ctx.dayOfWeek) return false;
  if (rule.minOccupancy != null && ctx.occupancyRate < decimal(rule.minOccupancy)) return false;
  if (rule.maxOccupancy != null && ctx.occupancyRate > decimal(rule.maxOccupancy)) return false;
  if (rule.minLeadDays != null && ctx.leadDays < rule.minLeadDays) return false;
  if (rule.maxLeadDays != null && ctx.leadDays > rule.maxLeadDays) return false;
  if (rule.demandLevel && rule.demandLevel !== ctx.demandLevel) return false;
  return true;
}

function applyRule(rate, rule) {
  if (rule.fixedRate != null) return decimal(rule.fixedRate);
  let next = rate;
  if (rule.adjustmentPct != null) next *= 1 + decimal(rule.adjustmentPct) / 100;
  if (rule.adjustmentAmt != null) next += decimal(rule.adjustmentAmt);
  return Math.max(0, next);
}

export async function calculateRate({ roomTypeId, checkInDate, checkOutDate, demandLevel = 'NORMAL' }) {
  const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
  if (!roomType || !roomType.isActive) return null;

  const occupancyRate = await getOccupancyRate(checkInDate, checkOutDate);
  const leadDays = Math.max(0, Math.ceil((checkInDate.getTime() - Date.now()) / 86400000));
  const dayOfWeek = checkInDate.getDay();

  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      OR: [{ roomTypeId: null }, { roomTypeId }]
    },
    orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }]
  });

  let rate = decimal(roomType.baseRate);
  const breakdown = [{ label: 'Base room rate', amount: rate }];

  for (const rule of rules) {
    const ctx = { roomTypeId, checkInDate, checkOutDate, occupancyRate, leadDays, dayOfWeek, demandLevel };
    if (!ruleMatches(rule, ctx)) continue;
    const previous = rate;
    rate = applyRule(rate, rule);
    breakdown.push({ label: rule.name, amount: rate, change: rate - previous });
  }

  return {
    roomType,
    nightlyRate: Math.round(rate * 100) / 100,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
    leadDays,
    breakdown
  };
}

export async function getAvailableRoomTypeQuotes({ checkInDate, checkOutDate, guests }) {
  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true, capacity: { gte: guests } },
    orderBy: { baseRate: 'asc' }
  });

  const results = [];
  for (const roomType of roomTypes) {
    const sellable = await prisma.room.count({
      where: {
        roomTypeId: roomType.id,
        status: { notIn: ['MAINTENANCE', 'OUT_OF_SERVICE'] }
      }
    });

    const reserved = await prisma.reservation.count({
      where: {
        roomTypeId: roomType.id,
        ...overlaps(checkInDate, checkOutDate)
      }
    });

    const availableCount = Math.max(0, sellable - reserved);
    if (!availableCount) continue;

    const quote = await calculateRate({ roomTypeId: roomType.id, checkInDate, checkOutDate });
    results.push({
      roomType,
      availableCount,
      nightlyRate: quote.nightlyRate,
      pricingBreakdown: quote.breakdown
    });
  }

  return results;
}

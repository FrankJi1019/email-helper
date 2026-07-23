import { MessageResponseDtoSchema } from "../types/dto"
import type { ScheduledMessage } from "../types/domain"

export const mapMessageDtoToDomain = (dto: unknown): ScheduledMessage => {
  const parsed = MessageResponseDtoSchema.safeParse(dto)

  if (!parsed.success) {
    console.log(parsed.error)
    throw new Error("Invalid MessageResponseDto structure")
  }

  const parsedDto = parsed.data

  return {
    id: parsedDto.id,
    recipient: parsedDto.toEmail,
    subject: parsedDto.subject,
    body: parsedDto.body,
    scheduledAt: new Date(parsedDto.sendAt),
    status: parsedDto.status,
    createdAt: new Date(parsedDto.createdAt),
  }
}

export const mapMessagesDtoToDomain = (dtos: unknown[]): ScheduledMessage[] => {
  return dtos.map(mapMessageDtoToDomain)
}

import { useMutation, useQuery } from "@tanstack/react-query"
import { useHttpClient } from "./axios"
import { mapMessagesDtoToDomain } from "./mapper"
import type { ScheduleEmailPayloadDto } from "../types/dto"

export const useFetchScheduledEmails = () => {
    const apiClient = useHttpClient()
    const query = useQuery({
        queryKey: ["all-scheduled-emails"],
        queryFn: async () => {
            const { data } = await apiClient.get("schedules")
            return mapMessagesDtoToDomain(data.Items)
        }
    })
    return query
}

export const useCreateScheduledEmail = () => {
    const apiClient = useHttpClient()
    const mutation = useMutation({
        mutationFn: async (payload: ScheduleEmailPayloadDto) => {
            const { data } = await apiClient.post("schedules", payload)
            return data
        }
    })
    return mutation
}

export const useDeleteScheduledEmail = () => {
    const apiClient = useHttpClient()
    const mutation = useMutation({
        mutationFn: async ({id}: {id: string}) => {
            const { data } = await apiClient.delete(`schedules/${id}`)
            return data
        }
    })
    return mutation
}


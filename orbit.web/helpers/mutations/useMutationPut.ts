import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doPut, FetchResponse } from '../apiClient'

interface MutationPutOptions<TOutput> {
  url: string
  queryKey: string[]
  invalidateQuery: boolean
  onError?: (_error: Error) => void
  onSuccess?: (_data: TOutput | undefined) => void
}

export function useMutationPut<TInput, TOutput>(options: MutationPutOptions<TOutput>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TInput) => {
      const res: FetchResponse<TOutput> = await doPut<TOutput>(options.url, { body: input })

      if (!res.ok) {
        throw new Error(res.statusMessage ?? 'Failed to update')
      }

      return res.data
    },
    onSuccess: (data) => {
      if (options.onSuccess !== undefined) {
        options.onSuccess(data)
      }

      if (options.invalidateQuery) {
        queryClient.invalidateQueries({ queryKey: options.queryKey })
        return
      }

      if (data !== undefined) {
        queryClient.setQueryData(options.queryKey, data)
      }
    },
    onError(error) {
      if (options.onError !== undefined) {
        options.onError(error)
      }
    }
  })
}

export async function fetchRewards(address: string) {
  const response = await fetch(`/api/rewards?address=${address}`)
  if (!response.ok) {
    throw new Error("Failed to fetch rewards")
  }
  return response.json()
}

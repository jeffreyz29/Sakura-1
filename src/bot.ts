import { SakuraClient } from '#structures'

const client = new SakuraClient()

try {
	await client.start()
} catch (error) {
	console.error(error)
	process.exit(0)	
}
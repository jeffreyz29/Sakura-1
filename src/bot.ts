import { SakuraClient } from '#structures'
import { handleCodesTask } from '#utils'

const client = new SakuraClient()

try {
	await client.start()
	handleCodesTask()
} catch (error) {
	console.error(error)
	process.exit(0)	
}
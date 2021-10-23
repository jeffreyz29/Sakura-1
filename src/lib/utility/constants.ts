export const DiscordInviteRegex = /(?:https?:\/\/)?(?:\w+\.)?discord(?:(?:app)?\.com\/invite|\.gg)\/(?<code>[a-z0-9-]+)/gi

export enum EVENTS {
	INTERACTION_DENIED = 'interactionDenied',
	INTERACTION_ERROR = 'interactionError',
	INTERACTION_FINISH = 'interactionFinish',
	INTERACTION_RUN = 'interactionRun',
	INTERACTION_SUCCESS = 'interactionSuccess',
	UNKNOWN_INTERACTION = 'unknownInteraction'
}

export enum PRIORITY {
	CATEGORY,
	INVITE_CHECK
}
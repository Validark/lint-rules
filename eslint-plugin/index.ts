import { ESLintUtils } from "@typescript-eslint/experimental-utils";

const MESSAGE_ID = "bannedNullMessage";

export = {
	rules: {
		"ban-null": ESLintUtils.RuleCreator(name => name)<[], typeof MESSAGE_ID>({
			name: "ban-null",
			meta: {
				type: "problem",
				docs: {
					description: "Bans null from being used",
					category: "Possible Errors",
					recommended: "error",
				},
				fixable: "code",
				messages: {
					bannedNullMessage: "Don't use null. Use undefined instead",
				},
				schema: [],
			},
			defaultOptions: [],
			create(context) {
				return {
					TSNullKeyword(node) {
						node.type;
						context.report({
							node: node,
							messageId: MESSAGE_ID,
							fix: fixer => fixer.replaceText(node, "undefined"),
						});
					},

					Literal(node) {
						if (node.value === null)
							context.report({
								node: node,
								messageId: MESSAGE_ID,
								fix: fixer => fixer.replaceText(node, "undefined"),
							});
					},
				};
			},
		}),
	},
};

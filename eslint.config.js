import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
	{
		files: ["*.ts", "*.js", "*.json"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tsparser,
			globals: {
				console: "readonly",
				process: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			prettier: prettier,
		},
		rules: {
			"prettier/prettier": "error",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
			"no-unused-vars": "off",
		},
	},
	{
		ignores: ["node_modules/**", "*.lock", "*.pdf", "bun.lock", "opencode/**"],
	},
];

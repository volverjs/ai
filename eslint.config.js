import antfu from '@antfu/eslint-config'

export default antfu({
    typescript: {
        overrides: {
            'ts/consistent-type-definitions': 'off',
        },
    },
    vue: true,
    node: true,
    yaml: false,
    stylistic: {
        indent: 4,
        quotes: 'single',
        semi: false,
    },
    rules: {
        'style/no-tabs': 'off',
        'style/no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
        'sort-imports': 'off',
        'antfu/top-level-function': 'off',
        'perfectionist/sort-named-imports': 'off',
    },
    extends: [
        './.eslintrc-auto-import.json',
    ],
}, {
    ignores: ['.vscode', 'dist', 'node_modules'],
})

import { describe, it, expect } from 'vitest'
import { Translator } from '../src/Translator'

describe('translate', () => {
    it('check Translator', async () => {
        const translator = new Translator()
        expect(translator instanceof Translator).toBe(true)
    })
})

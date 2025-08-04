import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { GamePhysics } from './GamePhysics';
import { GameConfig } from '../types/GameTypes';

describe('GamePhysics.limitVelocity', () => {
  it('caps velocity above MAX_VELOCITY', () => {
    const overMax = GameConfig.MAX_VELOCITY + 10;
    const limited = GamePhysics.limitVelocity(overMax);
    assert.strictEqual(limited, GameConfig.MAX_VELOCITY);
  });

  it('caps velocity below negative MAX_VELOCITY', () => {
    const belowMin = -GameConfig.MAX_VELOCITY - 10;
    const limited = GamePhysics.limitVelocity(belowMin);
    assert.strictEqual(limited, -GameConfig.MAX_VELOCITY);
  });

  it('returns velocity within limits unchanged', () => {
    const insideMax = GameConfig.MAX_VELOCITY - 1;
    const limitedPositive = GamePhysics.limitVelocity(insideMax);
    assert.strictEqual(limitedPositive, insideMax);

    const insideMin = -GameConfig.MAX_VELOCITY + 1;
    const limitedNegative = GamePhysics.limitVelocity(insideMin);
    assert.strictEqual(limitedNegative, insideMin);
  });
});

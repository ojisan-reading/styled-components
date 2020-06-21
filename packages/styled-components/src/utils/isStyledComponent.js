// @flow

/**
 * s-cかどうかを判定
 * @param {} target
 * @疑問 なぜ必要？
 */
export default function isStyledComponent(target: any): boolean %checks {
  return target && typeof target.styledComponentId === 'string';
}

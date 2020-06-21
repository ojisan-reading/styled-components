// @flow
import constructWithOptions from './constructWithOptions';
import StyledComponent from '../models/StyledComponent';
import domElements from '../utils/domElements';

import type { Target } from '../types';

const styled = (tag: Target) =>
  /** @疑問: rulesいらないの？nullableじゃなくね？ */
  constructWithOptions(StyledComponent, tag);

// Shorthands for all valid HTML Elements

/** styled.div などの実装を登録していってる。
 * これはdefault import時に初回実行されるもの、ここで作られたものが登録されていく
 */
domElements.forEach(domElement => {
  styled[domElement] = styled(domElement);
});

export default styled;

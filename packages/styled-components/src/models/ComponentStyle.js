// @flow

import flatten from '../utils/flatten';
import { hash, phash } from '../utils/hash';
import generateName from '../utils/generateAlphabeticName';
import isStaticRules from '../utils/isStaticRules';
import StyleSheet from '../sheet';

import type { RuleSet, Stringifier } from '../types';

/*
 ComponentStyle is all the CSS-specific stuff, not
 the React-specific stuff.
 */

/**
 * s-cのmodelがcomponentStyleという変数で作られる
 */
export default class ComponentStyle {
  baseHash: number;

  componentId: string;

  isStatic: boolean;

  rules: RuleSet;

  staticRulesId: string;

  constructor(rules: RuleSet, componentId: string) {
    this.rules = rules;
    this.staticRulesId = '';
    this.isStatic = process.env.NODE_ENV === 'production' && isStaticRules(rules);
    this.componentId = componentId;
    /** @疑問: s-cのhashってこれ？ */
    this.baseHash = hash(componentId);

    // NOTE: This registers the componentId, which ensures a consistent order
    // for this component's styles compared to others
    StyleSheet.registerId(componentId);
  }

  /*
   * Flattens a rule set into valid CSS
   * Hashes it, wraps the whole chunk in a .hash1234 {}
   * Returns the hash to be injected on render()
   * */

  /**
   * hash を返す
   * @param {} executionContext
   * @param {*} styleSheet
   * @param {*} stylis
   */
  generateAndInjectStyles(executionContext: Object, styleSheet: StyleSheet, stylis: Stringifier) {
    const { componentId } = this;

    // force dynamic classnames if user-supplied stylis plugins are in use
    if (this.isStatic && !stylis.hash) {
      if (this.staticRulesId && styleSheet.hasNameForId(componentId, this.staticRulesId)) {
        return this.staticRulesId;
      }

      const cssStatic = flatten(this.rules, executionContext, styleSheet).join('');
      const name = generateName(phash(this.baseHash, cssStatic.length) >>> 0);

      if (!styleSheet.hasNameForId(componentId, name)) {
        const cssStaticFormatted = stylis(cssStatic, `.${name}`, undefined, componentId);

        styleSheet.insertRules(componentId, name, cssStaticFormatted);
      }

      this.staticRulesId = name;

      return name;
    } else {
      const { length } = this.rules;
      let dynamicHash = phash(this.baseHash, stylis.hash);
      let css = '';

      for (let i = 0; i < length; i++) {
        const partRule = this.rules[i];
        if (typeof partRule === 'string') {
          css += partRule;

          if (process.env.NODE_ENV !== 'production') dynamicHash = phash(dynamicHash, partRule + i);
        } else {
          const partChunk = flatten(partRule, executionContext, styleSheet);
          const partString = Array.isArray(partChunk) ? partChunk.join('') : partChunk;
          dynamicHash = phash(dynamicHash, partString + i);
          css += partString;
        }
      }

      const name = generateName(dynamicHash >>> 0);

      if (!styleSheet.hasNameForId(componentId, name)) {
        const cssFormatted = stylis(css, `.${name}`, undefined, componentId);
        styleSheet.insertRules(componentId, name, cssFormatted);
      }

      return name;
    }
  }
}

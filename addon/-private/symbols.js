import Ember from 'ember';

const {
  guidFor
} = Ember;

const uuid = guidFor(new Date());

export const HAS_PARACHUTE = `__has_parachute_${uuid}__`;
export const PARACHUTE_META = `__parachute_meta_${uuid}__`;

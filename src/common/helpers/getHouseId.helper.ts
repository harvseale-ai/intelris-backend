enum House {
  Commons = 'Commons',
  Lords = 'Lords',
}

const HOUSE_ID_MAP: Record<House, number> = {
  [House.Commons]: 1,
  [House.Lords]: 2,
};

export const getHouseIdHelper = (val: string | string[]): number[] => {
  if (Array.isArray(val)) {
    return val.map((v) => HOUSE_ID_MAP[v as House]);
  }
  return [HOUSE_ID_MAP[val as House]];
};

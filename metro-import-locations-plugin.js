function importLocationsPlugin() {
  return {
    visitor: {}
  };
}

function locToKey(loc) {
  if (!loc) return '';
  const { start, end } = loc;
  return `${start.line}:${start.column}-${end.line}:${end.column}`;
}

module.exports = { importLocationsPlugin, locToKey };

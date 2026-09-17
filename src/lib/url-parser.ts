export function parseUrlPath(path: string, template: string): string[] {
  const split = path.split('/').filter((p) => p.length > 0);
  const templateSplit = template.split('/').filter((p) => p.length > 0);
  const params: string[] = [];

  for (let i = 0; i < templateSplit.length; i++) {
    if (templateSplit[i].startsWith('[') && templateSplit[i].endsWith(']')) {
      params.push(split[i]);
    }
  }

  return params;
}

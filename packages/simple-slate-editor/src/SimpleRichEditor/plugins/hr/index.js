import Hr from './Hr';
const BLOCK_TYPE_HR = 'horizontal-line';
export const withHr = (editor) => {
  const { isVoid } = editor;
  if (editor.elementRenders) {
    editor.elementRenders[BLOCK_TYPE_HR] = Hr;
  }
  editor.isVoid = (element) => {
    return element.type === BLOCK_TYPE_HR ? true : isVoid(element);
  };

  return editor;
};

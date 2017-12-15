import { 
  ContentState,
  EditorState, 
  getDefaultKeyBinding,
  Modifier
} from 'draft-js';

type VimEditorState = {
  commandMode: boolean;
  editorState: EditorState;
};

const Keys = {
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76
};

const Commands = {
  CHAR_LEFT: 'char-left',
  CHAR_RIGHT: 'char-right',
  LINE_DOWN: 'line-down',
  LINE_UP: 'line-up',
  INSERT: 'insret'
};


export const handleKeyCommand: (
  command: string, vimState: VimEditorState
) => VimEditorState | void = (command, vimState) => {
  

  if(command === Commands.CHAR_LEFT) {
    if(vimState.commandMode) {
      return moveCursor({ x: -1 }, vimState);
    } else {
      return insertCharacter('h', vimState);
    }
  }

  if(command === Commands.CHAR_RIGHT) {
    if(vimState.commandMode) {
      return moveCursor({ x: 1 }, vimState);
    } else {
      return insertCharacter('l', vimState);
    }
  }

  if(command === Commands.INSERT) {

    if(vimState.commandMode) {
      return { ...vimState, commandMode: false };
    } else {
      return insertCharacter('i', vimState);
    }
  }

  if(command === Commands.LINE_DOWN) {
    if(vimState.commandMode) { 
      return moveCursor({ x: 0, y: 1 }, vimState);
    } else {
      return insertCharacter('j', vimState);
    }
  }

  if(command === Commands.LINE_UP) {
    if(vimState.commandMode) {
      console.log('here');
      return moveCursor({ x: 0, y: -1 }, vimState);
    } else {
      return insertCharacter('k', vimState);
    }
  }
  
  return;
};


export const insertCharacter: (
  character: string, vimState: VimEditorState
) => VimEditorState = (character, vimState) => {

  let editorState = vimState.editorState;
  let content: ContentState = editorState.getCurrentContent();
  let selection = editorState.getSelection();

  if(selection.isCollapsed()) {
    content = Modifier.insertText(content, selection, character);
    
    selection = selection.merge({ 
      anchorOffset: selection.getAnchorOffset() + 1,
      focusOffset: selection.getFocusOffset() + 1 
    });
  } else {
    content = Modifier.replaceText(content, selection, character);
    
    if(selection.isBackward) {
      selection = selection.merge({ 
        anchorOffset: selection.getFocusOffset() + 1,
        focusOffset: selection.getFocusOffset() + 1
      });
    } else {
      selection = selection.merge({ 
        anchorOffset: selection.getAnchorOffset() + 1,
        focusOffset: selection.getAnchorOffset() + 1 
      });
    }
  }

  editorState = EditorState.push(editorState, content, 'change-block-data');
  editorState = EditorState.forceSelection(editorState, selection);

  return { ...vimState, editorState };
};


export const keyBindingFn: (e) => string = (event) => {
  
  switch(event.keyCode) {

    case Keys.h:
      return Commands.CHAR_LEFT;

    case Keys.i: 
      return Commands.INSERT;

    case Keys.j:
      return Commands.LINE_DOWN;  

    case Keys.k:
      return Commands.LINE_UP;

    case Keys.l:
      return Commands.CHAR_RIGHT;
    
    default:
      return getDefaultKeyBinding(event);
  }
};


type CursorDiff = {
  x?: number; // horizontal movement within editor (< 0 = left, > 0 = right)
  y?: number;
};
export const moveCursor: (
  c: CursorDiff, v: VimEditorState
) => VimEditorState = (cursorDiff, vimState) => {

  let editorState = vimState.editorState;
  let selection = editorState.getSelection();
  let focusOffset = selection.getFocusOffset();
  let content = editorState.getCurrentContent();

  // adjust selection for y
  if(cursorDiff.y && cursorDiff.y !== 0) {
    let selectedBlock = content.getBlockForKey(selection.getFocusKey());
    for(let yOffset = 0; yOffset < Math.abs(cursorDiff.y); yOffset++) {
      let nextSelectedBlock;
      if(cursorDiff.y < 0) {
        nextSelectedBlock = content.getBlockBefore(selectedBlock.getKey());
      } else {
        nextSelectedBlock = content.getBlockAfter(selectedBlock.getKey());
      }
      if(nextSelectedBlock) { selectedBlock = nextSelectedBlock; }
    }
    selection = selection.merge({
      focusKey: selectedBlock.getKey(),
      anchorKey: selectedBlock.getKey()
    });
  }

  // adjust selection for X
  let focusedBlock = content.getBlockForKey(selection.getFocusKey());
  let nextFocusOffset = Math.max(0, focusOffset + cursorDiff.x);
  nextFocusOffset = Math.min(nextFocusOffset, focusedBlock.getLength());
  selection = selection.merge({ 
    anchorOffset: nextFocusOffset, 
    focusOffset: nextFocusOffset 
  });
  editorState = EditorState.forceSelection(editorState, selection);

  return { ...vimState, editorState };
};

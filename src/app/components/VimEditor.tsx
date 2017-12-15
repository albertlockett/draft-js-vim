import * as React from 'react';
import { ContentState, Editor, EditorState } from 'draft-js';
import { handleKeyCommand, keyBindingFn } from '../util/draft-vim-util';


const INITIAL_TEXT = `
const PORT = process.env.PORT || 9001;

const app = express();
const routes = ['/', '/index.html', '/bundle.js'];
app.get(routes, express.static(path.resolve(__dirname, '..', 'docbase')));

app.listen(PORT, () => {
  console.log(\`server listening on port \${PORT}\`);
});`

type State = {
  commandMode: boolean;
  editorState: EditorState;
};



export class VimEditor extends React.Component<{}, State> {

  constructor(props, context) {
    super(props, context);
    const content = ContentState.createFromText(INITIAL_TEXT);
    const editorState = EditorState.createWithContent(content);
    this.state = { commandMode: false, editorState };

    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onEscape = this.onEscape.bind(this);
  }


  private handleKeyCommand(command) {
    const nextState = handleKeyCommand(command, this.state);
    if(nextState) { 
      this.setState(nextState);
      return 'handled';
    }

    return 'not-handled';
  }


  private onEscape() {
    this.setState({ commandMode: true });
  }


  private onChange(editorState) {
    this.setState({ editorState });
  }


  render() {
    return (
      <div className={`vim-editor commandMode-${
        this.state.commandMode
      }`}>
          <Editor 
            editorState={this.state.editorState}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={keyBindingFn}
            onEscape={this.onEscape}
            onChange={this.onChange} />
        <div>{this.state.commandMode ? ":" : ""}</div>
      </div>
    );
  }

}

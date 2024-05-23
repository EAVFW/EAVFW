
import { IDataHelper } from './IDataHelper';

export class TestDataHelper implements IDataHelper {
  getBoardColumns(boardId: string) {
    return {
      data: {
        items: [
          { id: '1', taskstate: { id: '1', name: 'Todo' } },
          { id: '2', taskstate: { id: '2', name: 'In Progress' } },
          { id: '3', taskstate: { id: '3', name: 'Done' } }
        ]
      }
    };
  }

  getBoardTasks(boardId: string) {
    return {
      data: {
        items: [
          { id: '1', task: { id: '1', name: 'Task 1', description: 'Description 1', stateid: '1' } },
          { id: '2', task: { id: '2', name: 'Task 2', description: 'Description 2', stateid: '2' } }
        ]
      }
    };
  }
}

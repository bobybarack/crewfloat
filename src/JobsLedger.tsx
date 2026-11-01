import {useMemo} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {AllCommunityModule, ModuleRegistry, themeQuartz, type ColDef} from 'ag-grid-community';
import {money, type Job} from '../shared/model';

ModuleRegistry.registerModules([AllCommunityModule]);
const gridTheme = themeQuartz.withParams({ accentColor: '#21634f', backgroundColor: '#ffffff', foregroundColor: '#23362e', headerBackgroundColor: '#f5f7f5', borderColor: '#e1e7e2', fontFamily: 'Manrope Variable, sans-serif', fontSize: 12, rowHeight: 54, headerHeight: 40, wrapperBorderRadius: 0 });
type LedgerRow = Job & {depositLabel: string; status: string};
export default function JobsLedger({rows, query, onJob}: {rows: LedgerRow[]; query: string; onJob: (job: Job) => void}) {
  const cols = useMemo<ColDef[]>(() => [
    { field: 'name', headerName: 'Job / customer', flex: 2, minWidth: 200 },
    { field: 'cost', headerName: 'Materials', valueFormatter: p => money(p.value), minWidth: 120, flex: 1 },
    { field: 'value', headerName: 'Work value', valueFormatter: p => money(p.value), minWidth: 120, flex: 1 },
    { field: 'depositLabel', headerName: 'Deposit', minWidth: 150, flex: 1 },
    { field: 'status', headerName: 'Plan status', minWidth: 145, flex: 1, cellClass: p => p.value === 'Approved' ? 'cell-green' : p.value === 'Proposed' ? 'cell-proposed' : 'cell-amber' }
  ], []);
  return <div className="grid-wrapper"><AgGridReact<LedgerRow> theme={gridTheme} rowData={rows} columnDefs={cols} defaultColDef={{sortable: true, filter: true, resizable: true}} quickFilterText={query} getRowId={p => p.data.id} onRowClicked={e => {if (e.data) onJob(e.data);}} domLayout="autoHeight"/></div>;
}

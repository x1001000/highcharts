/* *
 *
 *  (c) 2009-2025 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sophie Bremer
 *  - Dawid Dragula
 *
 * */


'use strict';


/* *
 *
 *  Imports
 *
 * */


import type DataEvent from '../DataEvent';
import type SortModifierOptions from './SortModifierOptions';

import DataModifier from './DataModifier.js';
import DataTable from '../DataTable.js';
import U from '../../Core/Utilities.js';
const { merge } = U;


/* *
 *
 *  Declarations
 *
 * */


/** @private */
interface SortRowReference {
    index: number;
    row: DataTable.Row;
}


/* *
 *
 *  Class
 *
 * */

/**
 * Sort table rows according to values of a column.
 *
 */
class SortModifier extends DataModifier {

    /* *
     *
     *  Static Properties
     *
     * */

    /**
     * Default options to group table rows.
     */
    public static readonly defaultOptions: SortModifierOptions = {
        type: 'Sort',
        direction: 'desc',
        orderByColumn: 'y'
    };

    /* *
     *
     *  Static Functions
     *
     * */

    private static ascending(
        a: DataTable.CellType,
        b: DataTable.CellType
    ): number {
        return (
            (a || 0) < (b || 0) ? -1 :
                (a || 0) > (b || 0) ? 1 :
                    0
        );
    }

    private static descending(
        a: DataTable.CellType,
        b: DataTable.CellType
    ): number {
        return (
            (b || 0) < (a || 0) ? -1 :
                (b || 0) > (a || 0) ? 1 :
                    0
        );
    }

    private static compareFactory(
        direction: 'asc'|'desc',
        customCompare?: (a: DataTable.CellType, b: DataTable.CellType) => number
    ): ((a: DataTable.CellType, b: DataTable.CellType) => number) {
        if (customCompare) {
            if (direction === 'desc') {
                return (
                    a: DataTable.CellType,
                    b: DataTable.CellType
                ): number => -customCompare(a, b);
            }
            return customCompare;
        }

        return (
            direction === 'asc' ?
                SortModifier.ascending :
                SortModifier.descending
        );
    }

    /* *
     *
     *  Constructor
     *
     * */

    /**
     * Constructs an instance of the range modifier.
     *
     * @param {Partial<RangeDataModifier.Options>} [options]
     * Options to configure the range modifier.
     */
    public constructor(
        options?: Partial<SortModifierOptions>
    ) {
        super();

        this.options = merge(SortModifier.defaultOptions, options);
    }

    /* *
     *
     *  Properties
     *
     * */

    public options: SortModifierOptions;

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Returns index and row for sort reference.
     *
     * @private
     *
     * @param {Highcharts.DataTable} table
     * Table with rows to reference.
     *
     * @return {Array<SortModifier.RowReference>}
     * Array of row references.
     */
    protected getRowReferences(
        table: DataTable
    ): Array<SortRowReference> {
        const rows = table.getRows(),
            rowReferences: Array<SortRowReference> = [];

        for (let i = 0, iEnd = rows.length; i < iEnd; ++i) {
            rowReferences.push({
                index: i,
                row: rows[i]
            });
        }

        return rowReferences;
    }

    /**
     * Applies partial modifications of a cell change to the property `modified`
     * of the given modified table.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {string} columnName
     * Column name of changed cell.
     *
     * @param {number|undefined} rowIndex
     * Row index of changed cell.
     *
     * @param {Highcharts.DataTableCellType} cellValue
     * Changed cell value.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Highcharts.DataTable}
     * Table with `modified` property as a reference.
     */
    public modifyCell<T extends DataTable>(
        table: T,
        columnName: string,
        rowIndex: number,
        cellValue: DataTable.CellType,
        eventDetail?: DataEvent.Detail
    ): T {
        const modifier = this,
            {
                orderByColumn,
                orderInColumn
            } = modifier.options;

        if (columnName === orderByColumn) {
            if (orderInColumn) {
                table.modified.setCell(columnName, rowIndex, cellValue);
                table.modified.setColumn(
                    orderInColumn,
                    modifier
                        .modifyTable(new DataTable({
                            columns: table
                                .getColumns([orderByColumn, orderInColumn])
                        }))
                        .modified
                        .getColumn(orderInColumn)
                );
            } else {
                modifier.modifyTable(table, eventDetail);
            }
        }

        return table;
    }

    /**
     * Applies partial modifications of column changes to the property
     * `modified` of the given table.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {Highcharts.DataTableColumnCollection} columns
     * Changed columns as a collection, where the keys are the column names.
     *
     * @param {number} [rowIndex=0]
     * Index of the first changed row.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Highcharts.DataTable}
     * Table with `modified` property as a reference.
     */
    public modifyColumns<T extends DataTable>(
        table: T,
        columns: DataTable.ColumnCollection,
        rowIndex: number,
        eventDetail?: DataEvent.Detail
    ): T {

        const modifier = this,
            {
                orderByColumn,
                orderInColumn
            } = modifier.options,
            columnNames = Object.keys(columns);

        if (columnNames.indexOf(orderByColumn) > -1) {
            if (
                orderInColumn &&
                columns[columnNames[0]].length
            ) {
                table.modified.setColumns(columns, rowIndex);
                table.modified.setColumn(
                    orderInColumn,
                    modifier
                        .modifyTable(new DataTable({
                            columns: table
                                .getColumns([orderByColumn, orderInColumn])
                        }))
                        .modified
                        .getColumn(orderInColumn)
                );
            } else {
                modifier.modifyTable(table, eventDetail);
            }
        }

        return table;
    }


    /**
     * Applies partial modifications of row changes to the property `modified`
     * of the given table.
     *
     * @param {Highcharts.DataTable} table
     * Modified table.
     *
     * @param {Array<(Highcharts.DataTableRow|Highcharts.DataTableRowObject)>} rows
     * Changed rows.
     *
     * @param {number} [rowIndex]
     * Index of the first changed row.
     *
     * @param {Highcharts.DataTableEventDetail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {Highcharts.DataTable}
     * Table with `modified` property as a reference.
     */
    public modifyRows<T extends DataTable>(
        table: T,
        rows: Array<(DataTable.Row|DataTable.RowObject)>,
        rowIndex: number,
        eventDetail?: DataEvent.Detail
    ): T {

        const modifier = this,
            {
                orderByColumn,
                orderInColumn
            } = modifier.options;

        if (
            orderInColumn &&
            rows.length
        ) {
            table.modified.setRows(rows, rowIndex);
            table.modified.setColumn(
                orderInColumn,
                modifier
                    .modifyTable(new DataTable({
                        columns: table
                            .getColumns([orderByColumn, orderInColumn])
                    }))
                    .modified
                    .getColumn(orderInColumn)
            );
        } else {
            modifier.modifyTable(table, eventDetail);
        }

        return table;
    }

    /**
     * Sorts rows in the table.
     *
     * @param {DataTable} table
     * Table to sort in.
     *
     * @param {DataEvent.Detail} [eventDetail]
     * Custom information for pending events.
     *
     * @return {DataTable}
     * Table with `modified` property as a reference.
     */
    public modifyTable<T extends DataTable>(
        table: T,
        eventDetail?: DataEvent.Detail
    ): T {
        const modifier = this;

        modifier.emit({ type: 'modify', detail: eventDetail, table });

        const columnNames = table.getColumnNames(),
            rowCount = table.getRowCount(),
            rowReferences = this.getRowReferences(table),
            {
                direction,
                orderByColumn,
                orderInColumn,
                compare: customCompare
            } = modifier.options,
            compare = SortModifier.compareFactory(direction, customCompare),
            orderByColumnIndex = columnNames.indexOf(orderByColumn),
            modified = table.modified;

        if (orderByColumnIndex !== -1) {
            rowReferences.sort((a, b): number => compare(
                a.row[orderByColumnIndex],
                b.row[orderByColumnIndex]
            ));
        }

        if (orderInColumn) {
            const column: DataTable.Column = [];
            for (let i = 0; i < rowCount; ++i) {
                column[rowReferences[i].index] = i;
            }
            modified.setColumns({ [orderInColumn]: column });
        } else {
            const originalIndexes: Array<number|undefined> = [];
            const rows: Array<DataTable.Row> = [];

            let rowReference: SortRowReference;
            for (let i = 0; i < rowCount; ++i) {
                rowReference = rowReferences[i];

                originalIndexes.push(
                    modified.getOriginalRowIndex(rowReference.index)
                );
                rows.push(rowReference.row);
            }
            modified.setRows(rows, 0);
            modified.setOriginalRowIndexes(originalIndexes);
        }

        modifier.emit({ type: 'afterModify', detail: eventDetail, table });

        return table;
    }

}

/* *
 *
 *  Class Namespace
 *
 * */

/**
 * Additionally provided types for modifier events and options.
 */
namespace SortModifier {

}

/* *
 *
 *  Registry
 *
 * */

declare module './DataModifierType' {
    interface DataModifierTypes {
        Sort: typeof SortModifier;
    }
}

DataModifier.registerType('Sort', SortModifier);

/* *
 *
 *  Default Export
 *
 * */

export default SortModifier;

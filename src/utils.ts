/**
 * This file is part of the node-google-play-store distribution.
 * Copyright (c) e.GO Digital GmbH, Aachen, Germany (https://www.e-go-digital.com/)
 *
 * node-google-play-store is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * node-google-play-store is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as csv from 'csv-parser';
import * as fs from 'fs-extra';
import * as tmp from 'tmp';


/**
 * A CSV row.
 */
export type CSVRow = { [name: string]: string };

/**
 * A function for 'tempFile()' function.
 */
export type TempFileFunction<TResult extends any = any> = (file: string) => TResult | PromiseLike<TResult>;

/**
 * Checks if a value is (null) or (undefined).
 *
 * @param {unknown} val The value to check.
 * 
 * @return {boolean} Is (null) or (undefined).
 */
export function isNil(val: unknown): boolean {
    return null === val ||
        'undefined' === typeof val;
}

/**
 * Parses data as CSV.
 *
 * @param {any} data The data to parse.
 * 
 * @return {Promise<TRow[]>} The promise with the rows.
 */
export function readCSV<TRow extends any = CSVRow>(data: any): Promise<TRow[]> {
    return new Promise<TRow[]>((resolve, reject) => {
        try {
            const ROWS: TRow[] = [];

            const CSV_PARSER = csv({
                separator: ","
            });

            CSV_PARSER.once('error', (err) => {
                reject(err);
            });

            CSV_PARSER.once('end', () => {
                resolve(ROWS);
            });

            CSV_PARSER.on('readable', function () {
                try {
                    let r: any;
                    while (r = CSV_PARSER.read()) {
                        ROWS.push(r);
                    }
                } catch (e) {
                    reject(e);
                }
            });

            CSV_PARSER.write(data);

            CSV_PARSER.end();
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Invokes an action for a temp file.
 * 
 * @param {TempFileFunction<TResult>} func The function to invoke.
 * 
 * @return {Promise<TResult>} The promise with the result of the function.
 */
export function tempFile<TResult extends any = any>(
    func: TempFileFunction<TResult>
): Promise<TResult> {
    return new Promise<TResult>(async (resolve, reject) => {
        let fileToDelete: string | false = false;
        const TRY_DELETE = () => {
            try {
                if (false !== fileToDelete) {
                    if (fs.existsSync(fileToDelete)) {
                        fs.unlinkSync(fileToDelete);
                    }
                }
            } catch { }
        };

        const COMPLETE = (err: any, result?: TResult) => {
            TRY_DELETE();

            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        };

        try {
            tmp.file({
                keep: true,
            }, (err, name) => {
                if (err) {
                    COMPLETE(err);
                    return;
                }

                fileToDelete = name;

                try {
                    Promise.resolve(
                        func(name)
                    ).then((result) => {
                        COMPLETE(null, result);
                    }).catch((err) => {
                        COMPLETE(err);
                    });
                } catch (e) {
                    COMPLETE(e);
                }
            });
        } catch (e) {
            COMPLETE(e);
        }
    });
}

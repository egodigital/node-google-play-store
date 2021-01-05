/**
 * This file is part of the node-appstore-connect distribution.
 * Copyright (c) e.GO Digital GmbH, Aachen, Germany (https://www.e-go-digital.com/)
 *
 * node-appstore-connect is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * node-appstore-connect is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as csv from 'csv-parser';
import * as zlib from 'zlib';
import * as fs from "fs-extra";
import * as tmp from "tmp";

/**
 * A CSV row.
 */
export type CSVRow = { [name: string]: string };

/**
 * Unzips data.
 *
 * @param {zlib.InputType} input The data to unzip.
 * @param {string} [encoding] If defined, will result will be returned as string, with the given encoding.
 * 
 * @return {Promise<Buffer|string>} The promise with the unzipped data.
 */
export function gunzip(input: zlib.InputType): Promise<Buffer>;
export function gunzip(input: zlib.InputType, encoding: string): Promise<string>;
export function gunzip(input: zlib.InputType, encoding?: string): Promise<Buffer | string> {
    return new Promise<Buffer | string>((resolve, reject) => {
        try {
            zlib.gunzip(input, (err, unzipped) => {
                try {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            isNil(encoding) ?
                                unzipped : unzipped.toString(encoding)
                        );
                    }
                } catch (e) {
                    reject(e);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * A function for 'tempFile()' function.
 */
export type TempFileFunction<TResult extends any = any> = (file: string) => TResult | PromiseLike<TResult>;

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
                separator: "\t"
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

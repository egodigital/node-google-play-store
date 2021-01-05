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

import * as moment from 'moment';
import { Storage as GoogleCloudStorage } from '@google-cloud/storage';
import { isNil, readCSV } from '../client/utils';
import {GetAppDownloadsOptions} from "./get-app-download-options";
import {GetAppDownloadsResult} from "./get-app-downloads-result";
import {DownloadAppsOverviewReportOptions} from "./download-apps-overview-report-options";
import {AppsOverviewRow} from "./apps-overview-row";
import {DownloadsClientInterface} from "./downloads-client.interface";
import {TokenProvider} from "../client/token-provider";

/**
 * A client for the Play Store Connect API.
 */
export class DownloadsClient implements DownloadsClientInterface {

    /**
     * Initializes a new instance of that class.
     *
     * @param {TokenProvider} tokenProvider
     */
    public constructor(
        private readonly tokenProvider: TokenProvider
    ) { }

    /**
     * Downloads a summary of a sales report.
     *
     * @param {DownloadAppsOverviewReportOptions} opts The options.
     *
     * @return {Promise<AppsOverviewRow[]>} The promise with the rows.
     */
    public async downloadAppOverviewReport(opts: DownloadAppsOverviewReportOptions): Promise<AppsOverviewRow[]> {
        let reportDate = opts.date;
        if (isNil(reportDate)) {
            reportDate = moment();
        }
        if (!moment.isMoment(reportDate)) {
            reportDate = moment(reportDate);
        }

        const STORAGE = new GoogleCloudStorage({
            projectId: opts.projectId,
            keyFilename: this.tokenProvider.getKeyFilePath(),
        });

        const BUCKET = STORAGE.bucket('pubsite_prod_rev_' + opts.projectId);

        const FILES = (await BUCKET.getFiles())[0]
            .filter(x => 'string' === typeof x.name)
            .filter(x => x.name.startsWith('stats/installs/installs_'))
            .filter(x => x.name.endsWith(`_${(reportDate as moment.Moment).format('YYYYMM')}_overview.csv`));

        const ROWS: AppsOverviewRow[] = [];

        for (const F of FILES) {
            const DATA = (await F.download())[0];
            const CSV = await readCSV(DATA.toString('utf16le'));

            for (const R of CSV) {
                const COLUMNS = Object.keys(R);

                const DATE = R[COLUMNS[0]];

                if (DATE !== (reportDate as moment.Moment).format('YYYY-MM-DD')) {
                    continue;
                }

                ROWS.push({
                    'Date': DATE,
                    'Package Name': R[COLUMNS[1]],
                    'Daily Device Installs': R[COLUMNS[2]],
                    'Daily Device Uninstalls': R[COLUMNS[3]],
                    'Daily Device Upgrades': R[COLUMNS[4]],
                    'Total User Installs': R[COLUMNS[5]],
                    'Daily User Installs': R[COLUMNS[6]],
                    'Daily User Uninstalls': R[COLUMNS[7]],
                    'Active Device Installs': R[COLUMNS[8]],
                    'Install events': R[COLUMNS[9]],
                    'Update events': R[COLUMNS[10]],
                    'Uninstall events': R[COLUMNS[11]],
                });
            }
        }

        return ROWS;
    }

    /**
     * Returns a summary of app downloads.
     *
     * @param {GetAppDownloadsOptions} opts The options.
     *
     * @return {Promise<GetAppDownloadsResult>} The promise with the result.
     */
    public async getAppDownloads(opts: GetAppDownloadsOptions): Promise<GetAppDownloadsResult> {
        const CSV = await this.downloadAppOverviewReport(opts);

        const RESULT: GetAppDownloadsResult = {
            apps: {},
        };

        for (const R of CSV) {
            let item = RESULT.apps[R['Package Name']];
            if (isNil(item)) {
                RESULT.apps[R['Package Name']] = item = {
                    downloads: 0,
                };
            }

            let units = parseInt(R['Daily Device Installs']);

            item.downloads += isNaN(units) ?
                0 : units;
        }

        return RESULT;
    }
}
/**
 * Copyright 2018 Dragonchain, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { OverriddenCredentials, FetchOptions } from 'src/interfaces/DragonchainClientInterfaces';
export declare class DragonchainRequestObject {
    method: string;
    dragonchainId: string;
    timestamp: string;
    contentType: string;
    url: string;
    path: string;
    hmacAlgo: string;
    version: '1';
    overriddenCredentials?: OverriddenCredentials;
    headers: object;
    body: any;
    constructor(path: string, dragonchainId: string, fetchOptions: FetchOptions);
    asFetchOptions: (injectedCS?: any) => Promise<{
        method: string;
        body: any;
        headers: {
            'Content-Type': string;
            dragonchain: string;
            Authorization: any;
            timestamp: string;
        };
    }>;
}
/**
 * All Humans are welcome.
 */

/**
 * Copyright 2019 Dragonchain, Inc. or its affiliates. All Rights Reserved.
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

/**
 * Type of failure
 */
type failureCode = 'PARAM_ERROR' | 'NOT_FOUND'

/**
 * Error class thrown by the SDK
 * All expected errors thrown by the SDK should be an instantiation of this class, with different codes as appropriate
 */
export class FailureByDesign extends Error {
  code: failureCode
  message: string

  constructor (code: failureCode, message: string) {
    super(message)
    this.code = code
    this.message = message || 'Failure By Design'
  }
}

/**
 * All Humans are welcome.
 */

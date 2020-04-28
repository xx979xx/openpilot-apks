import React, { Component } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import Layout from '../../native/Layout';
import UploadProgressTimer from '../../timers/UploadProgressTimer';
import { formatSize } from '../../utils/bytes';
import { mpsToKph, mpsToMph, kphToMps, mphToMps } from '../../utils/conversions';
import { Params } from '../../config';
import { resetToLaunch } from '../../store/nav/actions';

import {
    updateSshEnabled,
} from '../../store/host/actions';
import {
    deleteParam,
    updateParam,
    refreshParams,
} from '../../store/params/actions';

import X from '../../themes';
import Styles from './SettingsStyles';

const SettingsRoutes = {
    PRIMARY: 'PRIMARY',
    ACCOUNT: 'ACCOUNT',
    DEVICE: 'DEVICE',
    NETWORK: 'NETWORK',
    DEVELOPER: 'DEVELOPER',
}

const Icons = {
    user: require('../../img/icon_user.png'),
    developer: require('../../img/icon_shell.png'),
    warning: require('../../img/icon_warning.png'),
    metric: require('../../img/icon_metric.png'),
    network: require('../../img/icon_network.png'),
    eon: require('../../img/icon_eon.png'),
    calibration: require('../../img/icon_calibration.png'),
    speedLimit: require('../../img/icon_speed_limit.png'),
    plus: require('../../img/icon_plus.png'),
    minus: require('../../img/icon_minus.png'),
    mapSpeed: require('../../img/icon_map.png'),
    openpilot: require('../../img/icon_openpilot.png'),
    openpilot_mirrored: require('../../img/icon_openpilot_mirrored.png'),
    monitoring: require('../../img/icon_monitoring.png'),
    road: require('../../img/icon_road.png'),
}

class Settings extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);

        this.state = {
            route: SettingsRoutes.PRIMARY,
            expandedCell: null,
            version: {
                versionString: '',
                gitBranch: null,
                gitRevision: null,
            },
            speedLimitOffsetInt: '0',
            githubUsername: '',
            authKeysUpdateState: null,
        }

        this.writeSshKeys = this.writeSshKeys.bind(this);
        this.toggleExpandGithubInput = this.toggleExpandGithubInput.bind(this);
    }

    async componentWillMount() {
        UploadProgressTimer.start(this.props.dispatch);
        await this.props.refreshParams();
        const {
            isMetric,
            params: {
                SpeedLimitOffset: speedLimitOffset
            },
        } = this.props;

        if (isMetric) {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset)) })
        } else {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset)) })
        }
    }

    async componentWillUnmount() {
        await Layout.emitSidebarExpanded();
        UploadProgressTimer.stop();
    }

    handleExpanded(key) {
        const { expandedCell } = this.state;
        return this.setState({
            expandedCell: expandedCell == key ? null : key,
        })
    }

    handlePressedBack() {
        const { route } = this.state;
        if (route == SettingsRoutes.PRIMARY) {
            this.props.goBack();
        } else {
            this.handleNavigatedFromMenu(SettingsRoutes.PRIMARY);
        }
    }

    handleNavigatedFromMenu(route) {
        this.setState({ route: route })
        this.refs.settingsScrollView.scrollTo({ x: 0, y: 0, animated: false })
        this.props.refreshParams();
    }

    handlePressedResetCalibration = async () => {
        this.props.deleteParam(Params.KEY_CALIBRATION_PARAMS);
        this.setState({ calibration: null });
        Alert.alert('再起動', 'キャリブレーションをリセットするには再起動が必要です。', [
            { text: 'Later', onPress: () => {}, style: 'キャンセル' },
            { text: '今すぐ再起動', onPress: () => ChffrPlus.reboot() },
        ]);
    }

    // handleChangedSpeedLimitOffset(operator) {
    //     const { speedLimitOffset, isMetric } = this.props;
    //     let _speedLimitOffset;
    //     let _speedLimitOffsetInt;
    //     switch (operator) {
    //       case 'increment':
    //           if (isMetric) {
    //               _speedLimitOffset = kphToMps(Math.max(Math.min(speedLimitOffsetInt + 1, 25), -15));
    //               _speedLimitOffsetInt = Math.round(mpsToKph(_speedLimitOffset));
    //           } else {
    //               _speedLimitOffset = mphToMps(Math.max(Math.min(speedLimitOffsetInt + 1, 15), -10));
    //               _speedLimitOffsetInt = Math.round(mpsToMph(_speedLimitOffset));
    //           }
    //           break;
    //       case 'decrement':
    //           if (isMetric) {
    //               _speedLimitOffset = kphToMps(Math.max(Math.min(speedLimitOffsetInt - 1, 25), -15));
    //               _speedLimitOffsetInt = Math.round(mpsToKph(_speedLimitOffset));
    //           } else {
    //               _speedLimitOffset = mphToMps(Math.max(Math.min(speedLimitOffsetInt - 1, 15), -10));
    //               _speedLimitOffsetInt = Math.round(mpsToMph(_speedLimitOffset));
    //           }
    //           break;
    //     }
    //     this.setState({ speedLimitOffsetInt: _speedLimitOffsetInt });
    //     this.props.setSpeedLimitOffset(_speedLimitOffset);
    // }

    // handleChangedIsMetric() {
    //     const { isMetric, speedLimitOffset } = this.props;
    //     const { speedLimitOffsetInt } = this.state;
    //     if (isMetric) {
    //         this.setState({ speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset)) })
    //         this.props.setMetric(false);
    //     } else {
    //         this.setState({ speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset)) })
    //         this.props.setMetric(true);
    //     }
    // }

    renderSettingsMenu() {
        const {
            isPaired,
            wifiState,
            simState,
            freeSpace,
            params: {
                Passive: isPassive,
                Version: version,
            },
        } = this.props;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'openpilot';
        let connectivity = 'Disconnected'
        if (wifiState.isConnected && wifiState.ssid) {
            connectivity = wifiState.ssid;
        } else if (simState.networkType && simState.networkType != 'NO SIM') {
            connectivity = simState.networkType;
        }
        const settingsMenuItems = [
            {
                icon: Icons.user,
                title: 'アカウント',
                context: isPaired ? '連携' : '連携解除',
                route: SettingsRoutes.ACCOUNT,
            },
            {
                icon: Icons.eon,
                title: 'デバイス',
                context: `${ parseInt(freeSpace) + '%' } Free`,
                route: SettingsRoutes.DEVICE,
            },
            {
                icon: Icons.network,
                title: 'WiFi',
                context: connectivity,
                route: SettingsRoutes.NETWORK,
            },
            {
                icon: Icons.developer,
                title: '開発者',
                context: `${ software } v${ version.split('-')[0] }`,
                route: SettingsRoutes.DEVELOPER,
            },
        ];
        return settingsMenuItems.map((item, idx) => {
            const cellButtonStyle = [
              Styles.settingsMenuItem,
              idx == 3 ? Styles.settingsMenuItemBorderless : null,
            ]
            return (
                <View key={ idx } style={ cellButtonStyle }>
                    <X.Button
                        color='transparent'
                        size='full'
                        style={ Styles.settingsMenuItemButton }
                        onPress={ () => this.handleNavigatedFromMenu(item.route) }>
                        <X.Image
                            source={ item.icon }
                            style={ Styles.settingsMenuItemIcon } />
                        <X.Text
                            color='white'
                            size='small'
                            weight='semibold'
                            style={ Styles.settingsMenuItemTitle }>
                            { item.title }
                        </X.Text>
                        <X.Text
                            color='white'
                            size='tiny'
                            weight='light'
                            style={ Styles.settingsMenuItemContext }>
                            { item.context }
                        </X.Text>
                    </X.Button>
                </View>
            )
        })
    }

    renderPrimarySettings() {
        const {
            params: {
                RecordFront: recordFront,
                IsRHD: isRHD,
                IsMetric: isMetric,
                LongitudinalControl: hasLongitudinalControl,
                LimitSetSpeed: limitSetSpeed,
                SpeedLimitOffset: speedLimitOffset,
                OpenpilotEnabledToggle: openpilotEnabled,
                Passive: isPassive,
                IsLdwEnabled: isLaneDepartureWarningEnabled,
                LaneChangeEnabled: laneChangeEnabled,
            },
        } = this.props;
        const { expandedCell, speedLimitOffsetInt } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table direction='row' color='darkBlue'>
                        { this.renderSettingsMenu() }
                    </X.Table>
                    <X.Table color='darkBlue'>
                        { !parseInt(isPassive) ? (
                            <X.TableCell
                                type='switch'
                                title='オープンパイロットを有効化'
                                value={ !!parseInt(openpilotEnabled) }
                                iconSource={ Icons.openpilot }
                                description='オープンパイロットはACCとLKAです。この機能を使用するには、常に注意が必要です。設定の変更は、車の電源がオフの時に可能です。'
                                isExpanded={ expandedCell == 'openpilot_enabled' }
                                handleExpanded={ () => this.handleExpanded('openpilot_enabled') }
                                handleChanged={ this.props.setOpenpilotEnabled } />
                        ) : null }
                        { !parseInt(isPassive) ? (
                            <X.TableCell
                                type='switch'
                                title='車線変更支援を有効化'
                                value={ !!parseInt(laneChangeEnabled) }
                                iconSource={ Icons.road }
                                description='車線変更支援を使用するには、方向指示器を作動させてハンドルをゆっくりと動かします。オープンパイロットは車線変更が安全かどうかチェックすることはできません。ですので、この機能をを使用する際は周囲の状況に常に気を配ってください。'
                                isExpanded={ expandedCell == 'lanechange_enabled' }
                                handleExpanded={ () => this.handleExpanded('lanechange_enabled') }
                                handleChanged={ this.props.setLaneChangeEnabled } />
                        ) : null }
                        <X.TableCell
                            type='switch'
                            title='車線逸脱警報を有効化'
                            value={ !!parseInt(isLaneDepartureWarningEnabled) }
                            iconSource={ Icons.warning }
                            description='時速50Km以上で走行中に方向指示器が動作していない状態で車線を逸脱した場合に、元に戻るように警告を表示させることができます。'
                            isExpanded={ expandedCell == 'ldw' }
                            handleExpanded={ () => this.handleExpanded('ldw') }
                            handleChanged={ this.props.setLaneDepartureWarningEnabled } />
                        <X.TableCell
                            type='switch'
                            title='ドライバー側の映像の記録とアップロード'
                            value={ !!parseInt(recordFront) }
                            iconSource={ Icons.network }
                            description='ドライバー側のカメラ映像をアップロードし、ドライバー監視アルゴリズムの改善に協力します。'
                            isExpanded={ expandedCell == 'record_front' }
                            handleExpanded={ () => this.handleExpanded('record_front') }
                            handleChanged={ this.props.setRecordFront } />
                        <X.TableCell
                            type='switch'
                            title='右ハンドル'
                            value={ !!parseInt(isRHD) }
                            iconSource={ Icons.openpilot_mirrored }
                            description='オープンパイロットが左側通行の交通ルール順守することを許可し右側の運転席を監視します。'
                            isExpanded={ expandedCell == 'is_rhd' }
                            handleExpanded={ () => this.handleExpanded('is_rhd') }
                            handleChanged={ this.props.setIsRHD } />
                        <X.TableCell
                            type='switch'
                            title='メートル法を使用'
                            value={ !!parseInt(isMetric) }
                            iconSource={ Icons.metric }
                            description='速度をmp/hではなくkm/hで表示します。'
                            isExpanded={ expandedCell == 'metric' }
                            handleExpanded={ () => this.handleExpanded('metric') }
                            handleChanged={ this.props.setMetric } />
                      </X.Table>
                      {/*
                      <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='Add Speed Limit Offset'
                            iconSource={ Icons.speedLimit }
                            description='Customize the default speed limit warning with an offset in km/h or mph above the posted legal limit when available.'
                            isExpanded={ expandedCell == 'speedLimitOffset' }
                            handleExpanded={ () => this.handleExpanded('speedLimitOffset') }
                            handleChanged={ this.props.setLimitSetSpeed }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsSpeedLimitOffset }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: speedLimitOffsetInt == (isMetric ? -15 : -10) ? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedSpeedLimitOffset('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { speedLimitOffsetInt }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: speedLimitOffsetInt == (isMetric ? 25 : 15) ? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedSpeedLimitOffset('increment') }>
                                    <X.Image
                                        source={ Icons.plus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                        <X.TableCell
                            type='switch'
                            title='Use Map To Control Vehicle Speed'
                            value={ !!parseInt(limitSetSpeed) }
                            isDisabled={ !parseInt(hasLongitudinalControl) }
                            iconSource={ Icons.mapSpeed }
                            description='Use map data to control the vehicle speed. A curvy road icon appears when the car automatically slows down for upcoming turns. The vehicle speed is also limited by the posted legal limit, when available, including the custom offset. This feature is only available for cars where openpilot manages longitudinal control and when EON has internet connectivity. The map icon appears when map data are downloaded.'
                            isExpanded={ expandedCell == 'limitSetSpeed' }
                            handleExpanded={ () => this.handleExpanded('limitSetSpeed') }
                            handleChanged={ this.props.setLimitSetSpeed } />
                    </X.Table>
                    */}
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={ () => this.props.openTrainingGuide() }>
                            トレーニングガイドの確認
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderAccountSettings() {
        const { isPaired } = this.props;
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  アカウント設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <View>
                        <X.Table>
                            <X.TableCell
                                title='デバイス連携済'
                                value={ isPaired ? 'はい' : 'いいえ' } />
                            { isPaired ? (
                                <X.Text
                                    color='white'
                                    size='tiny'>
                                    コンマアプリの設定でデバイスの連携を解除できます。
                                </X.Text>
                            ) : null }
                            <X.Line color='light' />
                            <X.Text
                                color='white'
                                size='tiny'>
                                利用規約 {'https://my.comma.ai/terms.html'}
                            </X.Text>
                        </X.Table>
                        { isPaired ? null : (
                            <X.Table color='darkBlue' padding='big'>
                                <X.Button
                                    color='settingsDefault'
                                    size='small'
                                    onPress={ this.props.openPairing }>
                                    デバイス連携
                                </X.Button>
                            </X.Table>
                        ) }
                    </View>
                </ScrollView>
            </View>
        )
    }

    renderDeviceSettings() {
        const {
            expandedCell,
        } = this.state;

        const {
            serialNumber,
            txSpeedKbps,
            freeSpace,
            isPaired,
            params: {
                DongleId: dongleId,
                Passive: isPassive,
            },
            isOffroad,
        } = this.props;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'openpilot';
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  デバイス設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='キャリブレーション'
                            iconSource={ Icons.calibration }
                            description='キャリブレーションアルゴリズムは道路側のカメラで常に有効になっています。キャリブレーションのリセットは、キャリブレーションエラーが発生した場合か別の位置に取り付けした場合のみに行ってください。'
                            isExpanded={ expandedCell == 'calibration' }
                            handleExpanded={ () => this.handleExpanded('calibration') }>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={ this.handlePressedResetCalibration  }
                                style={ { minWidth: '100%' } }>
                                リセット
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='ドライバーカメラビュー'
                            iconSource={ Icons.monitoring }
                            description='ドライバー側のカメラを見ながらデバイスの取り付け位置を最適化し、ドライバーの監視を最適化します。(オフロードでの使用のみ)'
                            isExpanded={ expandedCell == 'driver_view_enabled' }
                            handleExpanded={ () => this.handleExpanded('driver_view_enabled') } >
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                isDisabled={ !isOffroad }
                                onPress={ this.props.setIsDriverViewEnabled  }
                                style={ { minWidth: '100%' } }>
                                Preview
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table>
                        <X.TableCell
                            title='連携済み'
                            value={ isPaired ? 'はい' : 'いいえ' } />
                        <X.TableCell
                            title='ドングル ID'
                            value={ dongleId } />
                        <X.TableCell
                            title='シリアルナンバー'
                            value={ serialNumber } />
                        <X.TableCell
                            title='空き容量'
                            value={ parseInt(freeSpace) + '%' }
                             />
                        <X.TableCell
                            title='アップロード速度'
                            value={ txSpeedKbps + ' kbps' }
                             />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => this.props.reboot() }>
                            再起動
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => this.props.shutdown() }>
                            電源を切る
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderNetworkSettings() {
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  ネットワーク設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table spacing='big' color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ this.props.openWifiSettings }>
                            WiFi設定を開く
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ this.props.openTetheringSettings }>
                            テザリング設定を開く
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderDeveloperSettings() {
        const {
            isSshEnabled,
            params: {
                Version: version,
                GitBranch: gitBranch,
                GitCommit: gitRevision,
                Passive: isPassive,
                PandaFirmwareHex: pandaFirmwareHex,
                PandaDongleId: pandaDongleId,
                CommunityFeaturesToggle: communityFeatures,
            },
        } = this.props;
        const { expandedCell } = this.state;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'openpilot';
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  開発者設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='コミュニティ機能の有効化'
                            value={ !!parseInt(communityFeatures) }
                            iconSource={ Icons.developer }
                            descriptionExtra={
                              <X.Text color='white' size='tiny'>
                                  comma.aiが保守・サポートしていないオープンソースコミュニティの機能を使用します。標準の安全モデルを満たしているかどうか確認されていないので、使用する際には特に注意してください。:{'\n'}
                                  * GM car port{'\n'}
                                  * Toyota with DSU unplugged{'\n'}
                                  * Pedal interceptor{'\n'}
                              </X.Text>
                            }
                            isExpanded={ expandedCell == 'communityFeatures' }
                            handleExpanded={ () => this.handleExpanded('communityFeatures') }
                            handleChanged={ this.props.setCommunityFeatures } />
                        <X.TableCell
                            type='switch'
                            title='SSHを有効化'
                            value={ isSshEnabled }
                            iconSource={ Icons.developer }
                            description='Secure Shell (SSH) を使用してデバイスに接続できるようにします。'
                            isExpanded={ expandedCell == 'ssh' }
                            handleExpanded={ () => this.handleExpanded('ssh') }
                            handleChanged={ this.props.setSshEnabled } />
                        <X.TableCell
                            iconSource={ Icons.developer }
                            title='認可されたSSHキー'
                            descriptionExtra={ this.renderSshInput() }
                            isExpanded={ expandedCell === 'ssh_keys' }
                            handleExpanded={ this.toggleExpandGithubInput }
                            type='custom'>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={ this.toggleExpandGithubInput }
                                style={ { minWidth: '100%' } }>
                                { expandedCell === 'SSHキー' ? 'キャンセル' : '編集' }
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table spacing='none'>
                        <X.TableCell
                            title='バージョン'
                            value={ `${ software } v${ version }` } />
                        <X.TableCell
                            title='Git ブランチ'
                            value={ gitBranch } />
                        <X.TableCell
                            title='Git リビジョン'
                            value={ gitRevision.slice(0, 12) }
                            valueTextSize='tiny' />
                        <X.TableCell
                            title='パンダファームウェア'
                            value={ pandaFirmwareHex != null ? pandaFirmwareHex : 'N/A' }
                            valueTextSize='tiny' />
                        <X.TableCell
                            title='パンダドングル ID'
                            value={ (pandaDongleId != null && pandaDongleId != "unprovisioned") ? pandaDongleId : 'N/A' }
                            valueTextSize='tiny' />
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            color='settingsDefault'
                            size='small'
                            onPress={ this.props.uninstall }>
                            { `アンインストール ${ software }` }
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderSshInput() {
        let { githubUsername, authKeysUpdateState } = this.state;
        let githubUsernameIsValid = githubUsername.match(/[a-zA-Z0-9-]+/) !== null;

        return (
            <View>
                <X.Text color='white' size='tiny'>
                    警告:
                    {'\n'}
                    これにより、GitHub設定のすべての公開鍵へのSSHアクセスが許可されます。
                    {'\n'}
                    自分以外のGitHubユーザ名は絶対に入力しないでください。
                    {'\n'}
                    続行すると、組み込みのSSHキーは無効になります。
                    {'\n'}
                    コンマ従業員がGitHubの追加を要求することはありません。
                    {'\n'}
                </X.Text>
                <View style={ Styles.githubUsernameInputContainer }>
                    <X.Text
                        color='white'
                        weight='semibold'
                        size='small'
                        style={ Styles.githubUsernameInputLabel }>
                        GitHubユーザー名
                    </X.Text>
                    <TextInput
                        style={ Styles.githubUsernameInput }
                        onChangeText={ (text) => this.setState({ githubUsername: text, authKeysUpdateState: null })}
                        onFocus={ () => Layout.emitSidebarCollapsed() }
                        onBlur={ () => Layout.emitSidebarExpanded() }
                        value={ githubUsername }
                        ref={ ref => this.githubInput = ref }
                        underlineColorAndroid='transparent'
                    />
                </View>
                <View>
                    <X.Button
                        size='tiny'
                        color='settingsDefault'
                        isDisabled={ !githubUsernameIsValid }
                        onPress={ this.writeSshKeys }
                        style={ Styles.githubUsernameSaveButton }>
                        <X.Text color='white' size='small' style={ Styles.githubUsernameInputSave }>保存</X.Text>
                    </X.Button>
                    { authKeysUpdateState !== null &&
                        <View style={ Styles.githubUsernameInputStatus }>
                            { authKeysUpdateState === 'inflight' &&
                                <ActivityIndicator
                                    color='white'
                                    refreshing={ true }
                                    size={ 37 }
                                    style={ Styles.connectingIndicator } />
                            }
                            { authKeysUpdateState === 'failed' &&
                                <X.Text color='white' size='tiny'>保存に失敗しました。ユーザー名が正しく、インターネットに接続されていることを確認してください。</X.Text>
                            }
                        </View>
                    }
                    <View style={ Styles.githubSshKeyClearContainer }>
                        <X.Button
                            size='tiny'
                            color='settingsDefault'
                            onPress={ this.clearSshKeys }
                            style={ Styles.githubUsernameSaveButton }>
                            <X.Text color='white' size='small' style={ Styles.githubUsernameInputSave }>すべて削除</X.Text>
                        </X.Button>
                    </View>
                </View>
            </View>
        );
    }

    toggleExpandGithubInput() {
        this.setState({ authKeysUpdateState: null });
        this.handleExpanded('ssh_keys');
    }

    clearSshKeys() {
        ChffrPlus.resetSshKeys();
    }

    async writeSshKeys() {
        let { githubUsername } = this.state;

        try {
            this.setState({ authKeysUpdateState: 'inflight' })
            const resp = await fetch(`https://github.com/${githubUsername}.keys`);
            const githubKeys = (await resp.text());
            if (resp.status !== 200) {
                throw new Error('Non-200 response code from GitHub');
            }

            await ChffrPlus.writeParam(Params.KEY_GITHUB_SSH_KEYS, githubKeys);
            this.toggleExpandGithubInput();
        } catch(err) {
            console.log(err);
            this.setState({ authKeysUpdateState: 'failed' });
        }
    }

    renderSettingsByRoute() {
        const { route } = this.state;
        switch (route) {
            case SettingsRoutes.PRIMARY:
                return this.renderPrimarySettings();
            case SettingsRoutes.ACCOUNT:
                return this.renderAccountSettings();
            case SettingsRoutes.DEVICE:
                return this.renderDeviceSettings();
            case SettingsRoutes.NETWORK:
                return this.renderNetworkSettings();
            case SettingsRoutes.DEVELOPER:
                return this.renderDeveloperSettings();
        }
    }

    render() {
        return (
            <X.Gradient color='dark_blue'>
                { this.renderSettingsByRoute() }
            </X.Gradient>
        )
    }
}

const mapStateToProps = state => ({
    isSshEnabled: state.host.isSshEnabled,
    serialNumber: state.host.serial,
    simState: state.host.simState,
    wifiState: state.host.wifiState,
    isPaired: state.host.device && state.host.device.is_paired,
    isOffroad: state.host.isOffroad,

    // Uploader
    txSpeedKbps: parseInt(state.uploads.txSpeedKbps),
    freeSpace: state.host.thermal.freeSpace,

    params: state.params.params,
});

const mapDispatchToProps = dispatch => ({
    dispatch,
    goBack: async () => {
        await dispatch(resetToLaunch());
        await Layout.goBack();
    },
    openPairing: () => {
        dispatch(NavigationActions.navigate({ routeName: 'SetupQr' }));
    },
    openWifiSettings: async () => {
        await dispatch(NavigationActions.navigate({ routeName: 'SettingsWifi' }));
        Layout.emitSidebarCollapsed();
    },
    openTetheringSettings: async () => {
        Layout.emitSidebarCollapsed();
        ChffrPlus.openTetheringSettings();
    },
    reboot: () => {
        Alert.alert('再起動', '本当に再起動しますか？', [
            { text: 'キャンセル', onPress: () => {}, style: 'cancel' },
            { text: '再起動', onPress: () => ChffrPlus.reboot() },
        ]);
    },
    shutdown: () => {
        Alert.alert('電源を切る', '本当に電源を切りますか？', [
            { text: 'キャンセル', onPress: () => {}, style: 'cancel' },
            { text: 'シャットダウン', onPress: () => ChffrPlus.shutdown() },
        ]);
    },
    uninstall: () => {
        Alert.alert('アンインストール', '本当にアンインストールしますか？', [
            { text: 'キャンセル', onPress: () => {}, style: 'cancel' },
            { text: 'アンインストール', onPress: () => ChffrPlus.writeParam(Params.KEY_DO_UNINSTALL, "1") },
        ]);
    },
    openTrainingGuide: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({ routeName: 'Onboarding' })
            ]
        }))
    },
    setOpenpilotEnabled: (openpilotEnabled) => {
        dispatch(updateParam(Params.KEY_OPENPILOT_ENABLED, (openpilotEnabled | 0).toString()));
    },
    setMetric: (useMetricUnits) => {
        dispatch(updateParam(Params.KEY_IS_METRIC, (useMetricUnits | 0).toString()));
    },
    setRecordFront: (recordFront) => {
        dispatch(updateParam(Params.KEY_RECORD_FRONT, (recordFront | 0).toString()));
    },
    setIsRHD: (isRHD) => {
        dispatch(updateParam(Params.KEY_IS_RHD, (isRHD | 0).toString()));
    },
    setIsDriverViewEnabled: (isDriverViewEnabled) => {
        dispatch(updateParam(Params.KEY_IS_DRIVER_VIEW_ENABLED, (isDriverViewEnabled | 1).toString()));
    },
    setSshEnabled: (isSshEnabled) => {
        dispatch(updateSshEnabled(!!isSshEnabled));
    },
    setHasLongitudinalControl: (hasLongitudinalControl) => {
        dispatch(updateParam(Params.KEY_HAS_LONGITUDINAL_CONTROL, (hasLongitudinalControl | 0).toString()));
    },
    setLimitSetSpeed: (limitSetSpeed) => {
        dispatch(updateParam(Params.KEY_LIMIT_SET_SPEED, (limitSetSpeed | 0).toString()));
    },
    setSpeedLimitOffset: (speedLimitOffset) => {
        dispatch(updateParam(Params.KEY_SPEED_LIMIT_OFFSET, (speedLimitOffset).toString()));
    },
    setCommunityFeatures: (communityFeatures) => {
        if (communityFeatures == 1) {
            Alert.alert('コミュニティ機能を有効化', 'コミュニティで管理されている機能はcomma.aiが標準の安全モデルを満たしていることを確認していません。これらの機能を使用する際には十分に注意してください。', [
                { text: 'キャンセル', onPress: () => {}, style: 'cancel' },
                { text: '有効化', onPress: () => {
                    dispatch(updateParam(Params.KEY_COMMUNITY_FEATURES, (communityFeatures | 0).toString()));
                } },
            ]);
        } else {
            dispatch(updateParam(Params.KEY_COMMUNITY_FEATURES, (communityFeatures | 0).toString()));
        }
    },
    setLaneDepartureWarningEnabled: (isLaneDepartureWarningEnabled) => {
        dispatch(updateParam(Params.KEY_LANE_DEPARTURE_WARNING_ENABLED, (isLaneDepartureWarningEnabled | 0).toString()));
    },
    setLaneChangeEnabled: (laneChangeEnabled) => {
        dispatch(updateParam(Params.KEY_LANE_CHANGE_ENABLED, (laneChangeEnabled | 0).toString()));
    },
    deleteParam: (param) => {
        dispatch(deleteParam(param));
    },
    refreshParams: () => {
        dispatch(refreshParams());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
